from django.db import models

# Create your models here.
    
    
class Video( models.Model ):
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')
    fileMp4 = models.FileField(upload_to="ongoingon",verbose_name="MP4 File")
    fileWebM = models.FileField(upload_to="ongoingon",verbose_name="WebM File")
    thumbMp4 = models.FileField(upload_to="ongoingon",verbose_name="MP4 Thumb",blank=True)
    thumbWebM = models.FileField(upload_to="ongoingon",verbose_name="WebM Thumb",blank=True)
    screenShot = models.FileField(upload_to="ongoing",verbose_name="Screen Shot",blank=True)
    
    class Meta:
        abstract = True
       
    def delete(self, *args, **kwargs):
        self.fileMp4.delete()
        self.fileWebM.delete()
        self.thumbMp4.delete()
        self.thumbWebM.delete()
        self.screenShot.delete()
        super(Entry, self).delete(*args, **kwargs)
    
    def __unicode__(self):
        return self.title + ' (' + str(self.id) + ')'
        
class Snippet( Video ):
    pass
    
class Insight( Video ):
    pass
    





    
