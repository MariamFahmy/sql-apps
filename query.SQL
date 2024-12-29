SELECT DISTINCT ON (recipes_photos.photo_id)
    recipes.recipe_id, recipes.title,
    COALESCE(recipes_photos.url, 'default.jpg')
FROM 
    recipes
LEFT JOIN
    recipes_photos 
ON 
    recipes_photos.recipe_id=recipes.recipe_id;

SELECT 
ingredients.image AS ingredient_image,
ingredients.type AS ingredient_type,
ingredients.title AS ingredient_title
FROM
recipe_ingredients
INNER JOIN
recipes
ON 
recipe_ingredients.recipe_id=recipes.recipe_id
INNER JOIN
ingredients
ON
recipe_ingredients.ingredient_id=ingredients.id
WHERE recipes.recipe_id=29;
