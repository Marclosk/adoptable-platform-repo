from storages.backends.s3boto3 import S3Boto3Storage

class PublicMediaStorage(S3Boto3Storage):
    location = "public"
    default_acl = "public-read"
    file_overwrite = False

class PrivateMediaStorage(S3Boto3Storage):
    location = "private"
    default_acl = "private"
    file_overwrite = False
    custom_domain = False  # Evita que los archivos sean accesibles públicamente

