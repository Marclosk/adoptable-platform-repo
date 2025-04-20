from storages.backends.s3boto3 import S3Boto3Storage

class PublicMediaStorage(S3Boto3Storage):
    location = "public"
    default_acl = "public-read"
    file_overwrite = False

class PrivateMediaStorage(S3Boto3Storage):
    location = "private"
    default_acl = "private"
    file_overwrite = False
    custom_domain = False  

class PublicS3Boto3Storage(S3Boto3Storage):
    """
        Storage Bucket for public data (static files)
    """
    bucket_acl = 'download'
    default_acl = 'download'
    bucket_name = "public"
    auto_create_bucket = True

    def __init__(self, acl=None, bucket=None, **settings):
        if acl is not None:
            self.bucket_acl = acl
        if bucket is not None:
            self.bucket_name = bucket
        super().__init__(**settings)