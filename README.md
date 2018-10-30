# aws-lambda-tag-ec2-with-vpc-name

This NodeJS Lambda function adds an "ec2Name" tag to each EBS volume equal to the "Name" tag of the corresponding attached EC2 instance. 
The purpose is to make it easier to determine to which EC2 instances your EBS instances are attached. 

# Infrastructure

This [AWS SAM](https://github.com/awslabs/serverless-application-model) project deploys a serverless function comprised of a Lambda that 
is triggered once every 24 hours by a CloudWatch Event to tag EC2 instances with their corresponding VPC name. The included CloudFormation 
template also creates an IAM role for the Lambda that allows the function to perform required functions. 

# Deployment

1. Clone the repository
  ```sh
  git clone https://github.com/matwerber1/aws-lambda-tag-ebs-with-ec2-name
  ```

2. Within ./deploy.sh, replace YOUR_S3_BUCKET with an existing S3 bucket to use for uploading packaged template to CloudFormation. 
  
  ```sh
  aws cloudformation package \
      --template-file template.yaml \
      --s3-bucket YOUR_S3_BUCKET \
      --output-template-file packaged-template.yaml
  
  aws cloudformation deploy \
      --template-file packaged-template.yaml \
      --stack-name lambda-tag-ec2-with-vpc-name \
      --capabilities CAPABILITY_IAM
  ```

3. OPTIONAL - within ./src/index.js, set config.debug to true to have the Lambda function output raw API responses to the function logs. 

4. Run deploy.sh

  ```sh
  ./deploy.sh
  ```
  
# Example Results

Here is an example of the output from the Lambda function: 

  ```
  2018-10-30T20:42:32.445Z	51a4d268-dc84-11e8-8097-d7693e78af07	Tagged vol-0674d86bb7c52318c with Ec2Name tag = Marketplace-Bitnami-ReviewBoard
  2018-10-30T20:42:32.688Z	51a4d268-dc84-11e8-8097-d7693e78af07	Tagged vol-0b90b50570d4a6ab9 with Ec2Name tag = test-terraform
  2018-10-30T20:42:32.949Z	51a4d268-dc84-11e8-8097-d7693e78af07	Tagged vol-0fb2c7c959383c32a with Ec2Name tag = test-ssm-linux
  2018-10-30T20:42:33.383Z	51a4d268-dc84-11e8-8097-d7693e78af07	Tagged vol-08868110a8c072c3e with Ec2Name tag = test-ssm-windows
  2018-10-30T20:42:33.597Z	51a4d268-dc84-11e8-8097-d7693e78af07	Tagged vol-0b620cf16b070f4bc with Ec2Name tag = test-codedeploy-inplace-no-elb
  2018-10-30T20:42:33.798Z	51a4d268-dc84-11e8-8097-d7693e78af07	Tagged vol-08f899a3b302cf0ce with Ec2Name tag = railsdemo-WebApp
  2018-10-30T20:42:34.390Z	51a4d268-dc84-11e8-8097-d7693e78af07	Tagged vol-058f65526038d4658 with Ec2Name tag = aws-cloud9-Sandbox-68a43cfce78944fc9b12778c5783c7b2
  2018-10-30T20:42:34.567Z	51a4d268-dc84-11e8-8097-d7693e78af07	Tagged vol-021f553e0b7fc164c with Ec2Name tag = test-opsworks-stacks - nodejs-1
  2018-10-30T20:42:34.765Z	51a4d268-dc84-11e8-8097-d7693e78af07	Tagged vol-024d027dc4a4cfc68 with Ec2Name tag = parkswapapp
  ```

Here is an example of the effect that is visible from within the EBS console: 

  ![EBS Console Example](https://github.com/matwerber1/aws-lambda-tag-ec2-with-vpc-name/blob/master/images/ebs-console.png)