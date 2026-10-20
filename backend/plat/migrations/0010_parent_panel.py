import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plat', '0009_userpresence'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ParentAccount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone', models.CharField(blank=True, max_length=32)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='parent_account', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ParentSubscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plan', models.CharField(blank=True, max_length=16)),
                ('active_until', models.DateTimeField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('parent', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='parent_subscription', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ParentPayment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plan', models.CharField(max_length=16)),
                ('amount', models.PositiveIntegerField()),
                ('status', models.CharField(choices=[('pending', 'Kutilmoqda'), ('paid', "To'langan"), ('rejected', 'Rad etilgan')], default='pending', max_length=10)),
                ('note', models.CharField(blank=True, max_length=120)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('confirmed_at', models.DateTimeField(blank=True, null=True)),
                ('parent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parent_payments', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='ParentChild',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('usage_limit_minutes', models.PositiveIntegerField(blank=True, null=True)),
                ('cooldown_minutes', models.PositiveIntegerField(blank=True, null=True)),
                ('open_time', models.TimeField(blank=True, null=True)),
                ('close_time', models.TimeField(blank=True, null=True)),
                ('paused', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('child', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='parent_link', to=settings.AUTH_USER_MODEL)),
                ('parent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='children_links', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
