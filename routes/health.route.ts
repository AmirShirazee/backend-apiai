import {Router} from "express";

const router = Router();

router.get('/', (req, res) => {
    // Send a response to the client
    res.send('Hello, user! Something is being returned.');
}
);

export { router as uploadRouter };