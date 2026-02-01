const STORAGE_KEY = "meal-planner-data";

const weekStartInput = document.getElementById("week-start");
const recipeForm = document.getElementById("recipe-form");
const ingredientList = document.getElementById("ingredient-list");
const addIngredientBtn = document.getElementById("add-ingredient");
const recipeList = document.getElementById("recipe-list");
const planner = document.getElementById("planner");
const savePlanBtn = document.getElementById("save-plan");
const shoppingList = document.getElementById("shopping-list");
const refreshShoppingBtn = document.getElementById("refresh-shopping");
const searchInput = document.getElementById("recipe-search");
const demoBtn = document.getElementById("demo-data");
const exportBtn = document.getElementById("export-data");
const importInput = document.getElementById("import-data");

const ingredientTemplate = document.getElementById("ingredient-row-template");
const plannerRowTemplate = document.getElementById("planner-row-template");

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

let state = {
  recipes: [],
  plans: {},
  shopping: {}
};

const saveState = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    state = JSON.parse(saved);
  } catch (error) {
    console.error("Failed to parse saved data", error);
  }
};

const toISODate = (date) => date.toISOString().split("T")[0];

const getWeekStart = () => {
  if (weekStartInput.value) return weekStartInput.value;
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  now.setDate(now.getDate() + diff);
  const iso = toISODate(now);
  weekStartInput.value = iso;
  return iso;
};

const addIngredientRow = (data = {}) => {
  const row = ingredientTemplate.content.firstElementChild.cloneNode(true);
  row.querySelector(".ingredient-name").value = data.name || "";
  row.querySelector(".ingredient-qty").value = data.quantity || "";
  row.querySelector(".ingredient-unit").value = data.unit || "g";
  row.querySelector(".remove-ingredient").addEventListener("click", () => {
    row.remove();
  });
  ingredientList.appendChild(row);
};

const clearIngredientRows = () => {
  ingredientList.innerHTML = "";
  addIngredientRow();
};

const getRecipesFiltered = () => {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) return state.recipes;
  return state.recipes.filter((recipe) => {
    const tags = recipe.tags.join(" ");
    return (
      recipe.name.toLowerCase().includes(term) ||
      tags.toLowerCase().includes(term)
    );
  });
};

const renderRecipes = () => {
  recipeList.innerHTML = "";
  const filtered = getRecipesFiltered();
  if (!filtered.length) {
    recipeList.innerHTML = "<p class=\"muted\">No recipes yet. Add one!</p>";
    return;
  }

  filtered.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <h3>${recipe.name}</h3>
      <div class="recipe-meta">
        <span>${recipe.servings} servings</span>
        ${recipe.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
      <p>${recipe.instructions}</p>
    `;
    recipeList.appendChild(card);
  });
};

const renderPlanner = () => {
  const weekStart = getWeekStart();
  planner.innerHTML = "";
  const plan = state.plans[weekStart] || {};
  days.forEach((day) => {
    const row = plannerRowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector(".planner-day").textContent = day;
    row.querySelectorAll("select").forEach((select) => {
      select.innerHTML = `<option value="">-- Select recipe --</option>`;
      state.recipes.forEach((recipe) => {
        const option = document.createElement("option");
        option.value = recipe.id;
        option.textContent = recipe.name;
        select.appendChild(option);
      });
      const mealKey = select.dataset.meal;
      select.value = plan?.[day]?.[mealKey] || "";
    });
    planner.appendChild(row);
  });
};

const renderShopping = () => {
  const weekStart = getWeekStart();
  const plan = state.plans[weekStart] || {};
  const items = buildShoppingList(plan);
  const bought = state.shopping[weekStart] || {};
  shoppingList.innerHTML = "";
  if (!items.length) {
    shoppingList.innerHTML = "<p class=\"muted\">No items yet. Generate from a plan.</p>";
    return;
  }
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "shopping-item";
    if (bought[item.key]) row.classList.add("bought");

    const label = document.createElement("label");
    label.textContent = `${item.name} - ${item.quantity} ${item.unit}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!bought[item.key];
    checkbox.addEventListener("change", () => {
      if (!state.shopping[weekStart]) state.shopping[weekStart] = {};
      state.shopping[weekStart][item.key] = checkbox.checked;
      saveState();
      renderShopping();
    });

    row.append(label, checkbox);
    shoppingList.appendChild(row);
  });
};

const buildShoppingList = (plan) => {
  const totals = {};
  Object.values(plan).forEach((meals) => {
    Object.values(meals || {}).forEach((recipeId) => {
      const recipe = state.recipes.find((item) => item.id === recipeId);
      if (!recipe) return;
      recipe.ingredients.forEach((ingredient) => {
        const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`;
        if (!totals[key]) {
          totals[key] = { ...ingredient, quantity: 0, key };
        }
        totals[key].quantity += Number(ingredient.quantity || 0);
      });
    });
  });

  return Object.values(totals).map((item) => ({
    ...item,
    quantity: Number(item.quantity.toFixed(2))
  }));
};

const readIngredients = () => {
  const rows = [...ingredientList.querySelectorAll(".ingredient-row")];
  return rows
    .map((row) => {
      const name = row.querySelector(".ingredient-name").value.trim();
      const quantity = Number(row.querySelector(".ingredient-qty").value);
      const unit = row.querySelector(".ingredient-unit").value;
      return { name, quantity, unit };
    })
    .filter((item) => item.name);
};

const resetForm = () => {
  recipeForm.reset();
  clearIngredientRows();
};

const savePlan = () => {
  const weekStart = getWeekStart();
  const rows = [...planner.querySelectorAll(".planner-row")];
  const plan = {};
  rows.forEach((row) => {
    const day = row.querySelector(".planner-day").textContent;
    plan[day] = {};
    row.querySelectorAll("select").forEach((select) => {
      if (select.value) plan[day][select.dataset.meal] = select.value;
    });
  });
  state.plans[weekStart] = plan;
  saveState();
  renderShopping();
};

const exportData = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json"
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "meal-planner-data.json";
  link.click();
  URL.revokeObjectURL(link.href);
};

const importData = (file) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (!parsed.recipes || !parsed.plans) throw new Error("Invalid data");
      state = parsed;
      saveState();
      initializeUI();
    } catch (error) {
      alert("Import failed. Please check your JSON file.");
    }
  };
  reader.readAsText(file);
};

const loadDemoData = () => {
  state.recipes = [
    {
      id: crypto.randomUUID(),
      name: "Veggie Stir Fry",
      servings: 2,
      tags: ["quick", "vegan"],
      ingredients: [
        { name: "Broccoli", quantity: 200, unit: "g" },
        { name: "Carrot", quantity: 150, unit: "g" },
        { name: "Soy sauce", quantity: 30, unit: "ml" },
        { name: "Rice", quantity: 150, unit: "g" }
      ],
      instructions: "Stir fry veggies, add soy sauce, and serve with rice."
    },
    {
      id: crypto.randomUUID(),
      name: "Greek Salad",
      servings: 3,
      tags: ["salad", "fresh"],
      ingredients: [
        { name: "Tomato", quantity: 300, unit: "g" },
        { name: "Cucumber", quantity: 200, unit: "g" },
        { name: "Feta", quantity: 150, unit: "g" },
        { name: "Olives", quantity: 50, unit: "g" }
      ],
      instructions: "Chop veggies, toss with feta and olives."
    },
    {
      id: crypto.randomUUID(),
      name: "Overnight Oats",
      servings: 1,
      tags: ["breakfast"],
      ingredients: [
        { name: "Oats", quantity: 60, unit: "g" },
        { name: "Milk", quantity: 200, unit: "ml" },
        { name: "Berries", quantity: 100, unit: "g" }
      ],
      instructions: "Combine ingredients and chill overnight."
    }
  ];
  saveState();
  initializeUI();
};

const initializeUI = () => {
  renderRecipes();
  renderPlanner();
  renderShopping();
};

addIngredientBtn.addEventListener("click", () => addIngredientRow());

recipeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const ingredients = readIngredients();
  const newRecipe = {
    id: crypto.randomUUID(),
    name: document.getElementById("recipe-name").value.trim(),
    servings: Number(document.getElementById("recipe-servings").value),
    tags: document
      .getElementById("recipe-tags")
      .value.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    ingredients,
    instructions: document.getElementById("recipe-instructions").value.trim()
  };
  state.recipes.push(newRecipe);
  saveState();
  resetForm();
  renderRecipes();
  renderPlanner();
});

savePlanBtn.addEventListener("click", savePlan);
refreshShoppingBtn.addEventListener("click", renderShopping);
searchInput.addEventListener("input", renderRecipes);
demoBtn.addEventListener("click", loadDemoData);
exportBtn.addEventListener("click", exportData);
importInput.addEventListener("change", (event) => {
  if (event.target.files.length) {
    importData(event.target.files[0]);
  }
});

weekStartInput.addEventListener("change", () => {
  renderPlanner();
  renderShopping();
});

loadState();
clearIngredientRows();
initializeUI();
