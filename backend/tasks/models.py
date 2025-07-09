from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

# ---------- User ----------
class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN   = 'admin',   _('Админ')
        MANAGER = 'manager', _('Руководитель')
        WORKER  = 'worker',  _('Работник')

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.WORKER,
    )

    def __str__(self):
        return f'{self.username} ({self.get_role_display()})'


# ---------- Project ----------
class Project(models.Model):
    name        = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_date  = models.DateField()
    end_date    = models.DateField()
    manager     = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={'role': User.Role.MANAGER},
        related_name='managed_projects'
    )

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return self.name


# ---------- Task ----------
class Task(models.Model):
    class Status(models.TextChoices):
        TODO        = 'todo',        _('Нужно сделать')
        IN_PROGRESS = 'in_progress', _('В процессе')
        PAUSE       = 'pause',       _('Пауза')
        REVIEW      = 'review',      _('Ждёт проверки')
        DONE        = 'done',        _('Готово')

    class Priority(models.TextChoices):
        LOW    = 'low',    _('Низкий')
        MEDIUM = 'medium', _('Средний')
        HIGH   = 'high',   _('Высокий')

    title       = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    project     = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assignee    = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        limit_choices_to={'role': User.Role.WORKER},
        related_name='tasks'
    )
    status      = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    priority    = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    deadline    = models.DateField()
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ---------- Comment ----------
class Comment(models.Model):
    task       = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author     = models.ForeignKey(User, on_delete=models.CASCADE)
    text       = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Комментарий {self.author.username} → {self.task.title}'


# ---------- StatusChangeLog ----------
class StatusChangeLog(models.Model):
    task       = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='status_logs')
    user       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_at = models.DateTimeField(auto_now_add=True)
    comment    = models.TextField(blank=True)

    def __str__(self):
        return f'{self.task.title}: {self.old_status} → {self.new_status}'


# ---------- Notification ----------
class Notification(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read    = models.BooleanField(default=False)
    category   = models.CharField(max_length=50, default='info')

    def __str__(self):
        return f'Уведомление для {self.user.username}'


# ---------- TimeSpent ----------
class TimeSpent(models.Model):
    task       = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='timespent')
    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time   = models.DateTimeField(null=True, blank=True)
    comment    = models.TextField(blank=True)

    def duration(self):
        return self.end_time - self.start_time if self.end_time else None

    def __str__(self):
        return f'{self.user.username} → {self.task.title}'
