aws cloudformation package \
    --template-file template.yaml \
    --s3-bucket werberm-sandbox \
    --output-template-file packaged-template.yaml

aws cloudformation deploy \
    --template-file packaged-template.yaml \
    --stack-name lambda-tag-ebs-with-ec2-name \
    --capabilities CAPABILITY_IAM