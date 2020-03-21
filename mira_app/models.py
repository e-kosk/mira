from django.db import models


class ProductModel(models.Model):

    name = models.CharField(max_length=128, unique=True, null=False, verbose_name='Product name')
    quantity = models.PositiveSmallIntegerField(null=True, blank=True, default=1, verbose_name='Quantity')
    needed = models.BooleanField(default=True, verbose_name='Needed', help_text='Show in shopping list as needed')

    def __str__(self):
        return f'{"[X]" if self.needed else "[ ]":3} {self.name} ({self.quantity if self.quantity else ""})'

    def add_to_cart(self):
        self.needed = True
        self.save()

    def remove_from_cart(self):
        self.needed = False
        self.quantity = 1
        self.save()
