from django.contrib import admin
from django.conf import settings as dj_settings
from .models import ParentAccount, ParentChild, ParentPayment, ParentSubscription, PlatformSettings, SocialState, UsageState
from .parental import extend_subscription


@admin.register(PlatformSettings)
class PlatformSettingsAdmin(admin.ModelAdmin):
    list_display = ('open_time', 'close_time', 'usage_limit_minutes', 'cooldown_minutes', 'enabled', 'updated_at')


@admin.register(UsageState)
class UsageStateAdmin(admin.ModelAdmin):
    list_display = ('user', 'used_seconds', 'blocked_until', 'last_ping_at', 'updated_at')
    search_fields = ('user__username',)


@admin.register(SocialState)
class SocialStateAdmin(admin.ModelAdmin):
    readonly_fields = ('updated_at',)


@admin.register(ParentAccount)
class ParentAccountAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'created_at')
    search_fields = ('user__username', 'phone')


@admin.register(ParentSubscription)
class ParentSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('parent', 'plan', 'active_until')
    search_fields = ('parent__username',)


@admin.register(ParentChild)
class ParentChildAdmin(admin.ModelAdmin):
    list_display = ('parent', 'child', 'usage_limit_minutes', 'paused')
    search_fields = ('parent__username', 'child__username')


@admin.register(ParentPayment)
class ParentPaymentAdmin(admin.ModelAdmin):
    list_display = ('parent', 'plan', 'amount', 'status', 'note', 'created_at', 'confirmed_at')
    list_filter = ('status', 'plan')
    search_fields = ('parent__username', 'note')
    actions = ['confirm_payments', 'reject_payments']

    @admin.action(description="Tanlangan to'lovlarni tasdiqlash (obunani yoqish)")
    def confirm_payments(self, request, queryset):
        from django.utils import timezone
        for payment in queryset.filter(status=ParentPayment.PENDING):
            payment.status = ParentPayment.PAID
            payment.confirmed_at = timezone.now()
            payment.save(update_fields=['status', 'confirmed_at'])
            extend_subscription(payment.parent, payment.plan, dj_settings.PARENT_PLANS)

    @admin.action(description="Tanlangan to'lovlarni rad etish")
    def reject_payments(self, request, queryset):
        queryset.filter(status=ParentPayment.PENDING).update(status=ParentPayment.REJECTED)
