# Generated by Django 3.0.5 on 2020-08-07 15:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('battleshipServer', '0004_auto_20200514_0711'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='isOpen',
            field=models.BooleanField(default=False),
        ),
    ]