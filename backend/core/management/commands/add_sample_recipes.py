from django.core.management.base import BaseCommand
from core.models import Recipe

class Command(BaseCommand):
    help = 'Add sample recipes to the database.'

    def handle(self, *args, **options):
        samples = [
            {
                'name': 'Oatmeal with Fruit',
                'description': 'Healthy oatmeal topped with fresh fruit.',
                'ingredients': 'Oats, milk, banana, berries, honey',
                'instructions': 'Cook oats in milk. Top with sliced banana, berries, and a drizzle of honey.',
                'cuisine': 'American',
                'prep_time': 10,
                'calories': 250,
                'protein': 8,
                'carbs': 45,
                'fats': 4
            },
            {
                'name': 'Grilled Chicken Salad',
                'description': 'Lean grilled chicken breast on a bed of greens.',
                'ingredients': 'Chicken breast, lettuce, tomato, cucumber, olive oil, lemon',
                'instructions': 'Grill chicken. Toss greens with olive oil and lemon. Top with sliced chicken.',
                'cuisine': 'Mediterranean',
                'prep_time': 20,
                'calories': 320,
                'protein': 35,
                'carbs': 10,
                'fats': 14
            },
            {
                'name': 'Brown Rice with Dal',
                'description': 'Nutritious brown rice served with protein-rich dal.',
                'ingredients': 'Brown rice, lentils, onion, tomato, spices',
                'instructions': 'Cook rice. Prepare dal by boiling lentils and tempering with onion, tomato, and spices. Serve together.',
                'cuisine': 'Indian',
                'prep_time': 30,
                'calories': 400,
                'protein': 15,
                'carbs': 75,
                'fats': 4
            },
            {
                'name': 'Greek Yogurt with Nuts',
                'description': 'Creamy Greek yogurt topped with mixed nuts.',
                'ingredients': 'Greek yogurt, almonds, walnuts, honey',
                'instructions': 'Spoon yogurt into a bowl. Top with nuts and a drizzle of honey.',
                'cuisine': 'Greek',
                'prep_time': 5,
                'calories': 180,
                'protein': 12,
                'carbs': 15,
                'fats': 7
            }
        ]
        for rec in samples:
            Recipe.objects.get_or_create(name=rec['name'], defaults=rec)
        self.stdout.write(self.style.SUCCESS('Sample recipes added!'))
