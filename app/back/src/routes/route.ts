import { Router } from "express";
import deckController from "../controllers/deckController";
import cardController from "../controllers/cardController";

const route = Router();

route.get("/decks/top", deckController.getBestDecks);
route.post("/decks/suggestion", deckController.getDeckSuggestion);
route.get("/cards", cardController.getBestDecks);

export default route;
