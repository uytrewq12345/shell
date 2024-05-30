import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as fs from 'fs';
import * as yaml from 'js-yaml';


function replaceAndConvertYamlToJson(filePath: string, replaceDict: { [key: string]: string }): any {
    // YAMLファイルを読み込む
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // 文字列として置換処理を行う
    let replacedContents = fileContents;
    for (const [key, value] of Object.entries(replaceDict)) {
        if (replacedContents.includes(key)) {
            replacedContents = replacedContents.replace(new RegExp(key, 'g'), value);
        } else {
            throw new Error(`置換対象のキー "${key}" が見つかりませんでした。`);
        }
    }

    // 置換された文字列をパースしてJSON形式に変換する
    const yamlData = yaml.load(replacedContents) as Record<string, any>;
    return yamlData;
}



export class PlaceholoderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const filePath = 'test.yaml';
    /*
    const replaceDict: ReplaceDict = {
        // ここに置換辞書を定義
        '{{REPLICAS}}': '1000',
        'oldKey2': 'newKey2'
    };
    */
    const replaceDict = {
      // ここに置換辞書を定義
      'oldKey1': 'newKey1',
      'oldKey2': 'newKey2'
  };

    const jsonResult = replaceAndConvertYamlToJson(filePath, replaceDict);
    console.log(jsonResult);


  }
}
