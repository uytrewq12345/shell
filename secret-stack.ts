import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

const manifestFilePath = '/home/user/work/eks/aws-provider-installer.yaml';

export class SecretStack extends cdk.Stack {
    constructor(scope: Construct, id: string, eksCluster: eks.Cluster, props?: cdk.StackProps) {
        super(scope, id, props);
        const cluster = eksCluster;

        cluster.addHelmChart('SecretsStoreCsiDriver', {
            repository: 'https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts',
            chart: 'secrets-store-csi-driver',
            namespace: 'kube-system',
            release: 'csi-secrets-store',
        });
                
        const manifestContent = fs.readFileSync(manifestFilePath, 'utf8');
        const manifests = yaml.loadAll(manifestContent);
        
        manifests.forEach((manifest, index) => {
            cluster.addManifest(`AwsProvider${index}`, manifest as Record<string, any>);
        });

  }
}
