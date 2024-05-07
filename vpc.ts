import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC にカスタム CIDR ブロックを指定
    const vpc = new ec2.Vpc(this, 'CustomVpc', {
      cidr: '10.128.0.0/16',  // VPC 全体の CIDR ブロックを指定
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24  // パブリックサブネットに割り当てる CIDR マスク
        },
        {
          name: 'PrivateSubnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 18  // プライベートサブネットに割り当てる CIDR マスク
        },
        {
          name: 'PrivateSubnetForDatabase',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24  // プライベートサブネットに割り当てる CIDR マスク
        },

      ]
    });
  }
}
