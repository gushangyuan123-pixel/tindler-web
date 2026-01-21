# Generated manually for BCMemberWhitelist model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('bc_api', '0003_alter_bcapplicantprofile_role'),
    ]

    operations = [
        migrations.CreateModel(
            name='BCMemberWhitelist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(help_text='Berkeley email of the BC member', max_length=254, unique=True)),
                ('name', models.CharField(blank=True, help_text="Optional: BC member's name for reference", max_length=255)),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('notes', models.TextField(blank=True, help_text='Optional notes about this member')),
                ('added_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='whitelist_entries_added', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'BC Member Whitelist Entry',
                'verbose_name_plural': 'BC Member Whitelist',
                'ordering': ['email'],
            },
        ),
    ]
