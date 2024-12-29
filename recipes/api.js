const path = require("path");
const express = require("express");
const router = express.Router();

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);
router.get("/detail-client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail-client.js"))
);
router.get("/style.css", (_, res) =>
  res.sendFile(path.join(__dirname, "../style.css"))
);
router.get("/detail", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail.html"))
);

/**
 * Student code starts here
 */

// connect to postgres
const pg = require("pg");
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "recipeguru",
  password: "lol",
  port: 5432,
});

router.get("/search", async function (req, res) {
  console.log("search recipes");

  // return recipe_id, title, and the first photo as url
  //
  // for recipes without photos, return url as default.jpg
  const { rows } = await pool.query(`
      SELECT DISTINCT ON (recipes.recipe_id)
        recipes.recipe_id, 
        recipes.title,
        COALESCE(recipes_photos.url, 'default.jpg') AS url
      FROM 
        recipes
      LEFT JOIN
        recipes_photos 
      ON 
        recipes_photos.recipe_id=recipes.recipe_id;
    `);

  res.json({ rows });
});

router.get("/get", async (req, res) => {
  const recipeId = req.query.id ? +req.query.id : 1;
  console.log("recipe get", recipeId);

  // return all ingredient rows as ingredients
  //    name the ingredient image `ingredient_image`
  //    name the ingredient type `ingredient_type`
  //    name the ingredient title `ingredient_title`
  const ingredients = (
    await pool.query(
      `
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
    WHERE 
      recipes.recipe_id=$1;
    `,
      [recipeId]
    )
  ).rows;

  //
  // return all photo rows as photos
  //    return the title, body, and url (named the same)
  // return the title as title
  // return the body as body
  // if no row[0] has no photo, return it as default.jpg
  const { rows } = await pool.query(`
    SELECT title, body
    FROM recipes WHERE recipe_id=${recipeId};
  `);
  let photos = (
    await pool.query(
      `
    SELECT recipes_photos.url
    FROM recipes_photos
    INNER JOIN
      recipes
    ON
      recipes.recipe_id=recipes_photos.recipe_id
    WHERE
      recipes.recipe_id=$1;
    `,
      [recipeId]
    )
  ).rows;

  if (photos.length == 0) {
    photos = [{ url: "default.jpg" }];
  }

  res.json({
    ingredients: ingredients,
    photos: photos.map((row) => row.url),
    title: rows[0].title,
    body: rows[0].body,
  });
});
/**
 * Student code ends here
 */

module.exports = router;
