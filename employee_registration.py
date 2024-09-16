import boto3

s3 = boto3.client('s3')
rekognition = boto3.client('rekognition', region_name='us-east-1')
dynamodbTableName='employee'
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
employeeTable = dynamodb.Table(dynamodbTableName)

def lambda_handler(event,context):
    print(event) # falls es ein Fehler gibt
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event ['Records'][0]['s3']['object']['key']
    
    try:
        response=index_employee_image(bucket,key)
        print(response)
        #nur bei 200 ok meldung, holen wir uns den gesichtsID
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            faceId = response['FaceRecords'][0]['Face']['FaceId']
            name = key.split('.')[0].split('_')
            firstName = name[0]
            lastName = name[1]
            register_employee(faceId,firstName,lastName)
        return response
    except Exception as e:
        print(e)
        print('Error processing inhabitant image {} form bucket {}'.format(key,bucket))
        raise e
    
    #nun müssen die funktionen definiert werden
    
    def index_employee_image(bucket,key):
        response =rekognition.index_faces(
            Image={
                'S3Object': # es liest von
                    {
                        'Bucket': bucket,
                        'Name': key
                    }
            },
            CollectionId="employees"
        )
        return response
    
    def register_employee(faceId,firstName,lastName):
        employeeTable.put_item(
            Item={
                'rekognitionId': faceId,
                'firstName':firstName,
                'lastName':lastName
            }
        )