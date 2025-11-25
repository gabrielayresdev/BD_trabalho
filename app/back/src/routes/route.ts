import { Router } from "express";
import deckController from "../controllers/deckController";

const route = Router();

route.get("/decks/top", deckController.getBestDecks);
route.get("/decks/suggestion", deckController.getDeckSuggestion);

export default route;
