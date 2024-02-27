import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as rds from 'aws-cdk-lib/aws-rds';
import { createNamespace } from './util';

export function setupMlflow(scope: Construct, eksCluster: eks.Cluster) {
  // eksClusterから直接EKSクラスターにアクセス
  const cluster = eksCluster;
  
  // S3 Bucket
  const bucket = new s3.Bucket(scope, 'MyBucket', {
    versioned: true,
    removalPolicy: cdk.RemovalPolicy.DESTROY, // Change as needed
  });

  // Aurora用の新しいセキュリティグループを作成
  // EKSノードからのアクセスを許可するルールを追加
  const auroraSg = new ec2.SecurityGroup(scope, 'AuroraSecurityGroup', { vpc: cluster.vpc });
  auroraSg.addIngressRule(cluster.clusterSecurityGroup, ec2.Port.tcp(5432), 'Allow access from EKS Nodes');

  // Aurora Serverless Cluster
  const auroraDB = new rds.DatabaseCluster(scope, 'Database', {
    engine: rds.DatabaseClusterEngine.auroraPostgres({
      version: rds.AuroraPostgresEngineVersion.VER_15_5,
    }),
    vpc: cluster.vpc,
    vpcSubnets: {
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    },
    serverlessV2MinCapacity: 0.5,
    serverlessV2MaxCapacity: 2.0,
    defaultDatabaseName: 'mlflowdb',
    securityGroups:[ auroraSg ],
    writer: rds.ClusterInstance.serverlessV2('AuroraWriter', {}),
    readers: [
      rds.ClusterInstance.serverlessV2('AuroraReader', {
          scaleWithWriter: true,
      })
    ]
  });

  createNamespace(scope, cluster, 'mlflow');

  // Service Account with RW access to S3 and R access to Aurora Serverless secret
  const serviceAccount = cluster.addServiceAccount('serviceAccount', {
    name: 'mlflow-service-account',
    namespace: 'mlflow'
  });

  // Grant read-write access to the S3 bucket
  bucket.grantReadWrite(serviceAccount);

  // Grant read access to the Aurora Serverless cluster's secret
  auroraDB.secret?.grantRead(serviceAccount);
}
