CREDENTIALS=--username='$(user)' --password='$(pwd)' 
REGION=--cognito-region='us-east-1' --api-gateway-region='us-east-1'
POOLS=--user-pool-id='us-east-1_JMOzKqV2l' --app-client-id='3ofu710bjf6craud49nd99qqkl' \
	--identity-pool-id='us-east-1:4f02717b-cc32-420b-b85b-c18a03ce85b8'
URL=--invoke-url='https://1d6wk2lrbb.execute-api.us-east-1.amazonaws.com/prod'
URLPATH=--path-template='/docs'
POST=--method='POST'
GET=--method='GET'
DELETE=--method='DELETE'


test-list:
	apig-test $(CREDENTIALS) $(REGION) $(POOLS) $(URL) $(URLPATH)/$(id) $(GET)

test-list-for-user:
	apig-test $(CREDENTIALS) $(REGION) $(POOLS) $(URL) $(URLPATH)/$(id) $(GET)

test-convert:
	aws s3 cp tests/convertTest.txt s3://notes-app-s3-bucket-jcr/private/us-east-1:b8d57db8-8ffe-4b0a-9a9d-a57aa5b997b3/convertTest.txt

test-create:
	apig-test $(CREDENTIALS) $(REGION) $(POOLS) $(URL) $(URLPATH) $(POST) \
		--body='{"content":"hello world","attachment":"hello.jpg"}'

test-delete:
	apig-test $(CREDENTIALS) $(REGION) $(POOLS) $(URL) $(URLPATH)/$(id) $(DELETE)

new-user:
	aws cognito-idp sign-up \
		--region us-east-1 \
		--client-id 3ofu710bjf6craud49nd99qqkl \
		--username $(user) \
		--password $(pwd)
	aws cognito-idp admin-confirm-sign-up \
		--region us-east-1 \
		--user-pool-id us-east-1_JMOzKqV2l \
		--username $(user)