import * as eks from 'aws-cdk-lib/aws-eks';
import { Construct } from 'constructs';

// ネームスペースを作成する関数
export function createNamespace(scope: Construct, cluster: eks.Cluster, namespaceName: string) {
  const namespaceManifest = {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: {
      name: namespaceName,
    },
  };

  new eks.KubernetesManifest(scope, `${namespaceName}Namespace`, {
    cluster,
    manifest: [namespaceManifest],
  });
}
