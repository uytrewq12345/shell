import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';


export class IngressStack extends cdk.Stack {

  constructor(scope: Construct, id: string, eksCluster: eks.Cluster, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = eksCluster;

    // ALB Ingress Controller のデプロイ (Helm チャートを使用)
    cluster.addHelmChart('ALBIngressController', {
        chart: 'aws-load-balancer-controller',
        repository: 'https://aws.github.io/eks-charts',
        namespace: 'kube-system',
        release: 'aws-load-balancer-controller',
        values: {
          clusterName: cluster.clusterName,
          region: this.region,
          vpcId: cluster.vpc.vpcId,
          serviceAccount: {
            create: true,
            name: 'aws-load-balancer-controller',
          },
        },
      });
  
      
      // Traefik Ingress Controller  のデプロイ (Helm  チャートを使用)
      cluster.addHelmChart('TraefikIngressController', {
        chart: 'traefik',
        repository: 'https://helm.traefik.io/traefik',
        namespace: 'kube-system',
        release: 'traefik',
        values: {
          service: {
            type: 'LoadBalancer',
            annotations: {
              'service.beta.kubernetes.io/aws-load-balancer-internal': 'true',
            },
            providers: {
              kubernetesCRD: {
                allowCrossNamespace: 'true'
              }
            }
          },
        }
      });
      
  }
}
