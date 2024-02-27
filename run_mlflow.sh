SECRET_FILE=/mnt/secrets-store/secrets

USER=$(jq .username $SECRET_FILE -r)
PASSWORD=$(jq .password $SECRET_FILE -r)
HOST=$(jq .host $SECRET_FILE -r)
PORT=$(jq .port $SECRET_FILE -r)
DBNAME=$(jq .dbname $SECRET_FILE -r)
S3_BUCKET_NAME=hogefuga


mlflow server \
    --backend-store-uri postgresql+psycopg2://${USER}:${PASSWORD}@${HOST}:${PORT}/${DBNAME} \
    --default-artifact-root s3://${S3_BUCKET_NAME} \
    --host 0.0.0.0
