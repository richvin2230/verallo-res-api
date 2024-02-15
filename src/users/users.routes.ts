import express, { Request, Response } from "express";
import { UnitUser } from "./user.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./user.database";

export const userRouter = express.Router();

userRouter.get("/users", async (req: Request, res: Response) => {
    try {
        const allUsers: UnitUser[] = await database.findAll();

        if (!allUsers || allUsers.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: `No users found at this time.` });
        }

        return res.status(StatusCodes.OK).json({ total_users: allUsers.length, allUsers });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error});
    }
});

userRouter.get("/user/:id", async (req: Request, res: Response) => {
    try {
        const user: UnitUser | undefined = await database.findOne(req.params.id);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `User not found!` });
        }

        return res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error});
    }
});

userRouter.post("/register", async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: `Please provide all the required parameters.` });
        }

        const existingUser = await database.findByEmail(email);

        if (existingUser) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: `This email has already been registered.` });
        }

        const newUser = await database.create(req.body);

        return res.status(StatusCodes.CREATED).json({ newUser });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error});
    }
});

userRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: `Please provide all the required parameters.` });
        }

        const user = await database.comparePassword(email, password);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `No user exists with the email provided.` });
        }

        return res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error});
    }
});

userRouter.put('/user/:id', async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const userToUpdate = await database.findOne(req.params.id);

        if (!username || !email || !password || !userToUpdate) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: `Please provide all the required parameters.` });
        }

        const updatedUser = await database.update(req.params.id, req.body);

        return res.status(StatusCodes.CREATED).json({ updateUser: updatedUser });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error});
    }
});

userRouter.delete("/user/:id", async (req: Request, res: Response) => {
    try {
        const user = await database.findOne(req.params.id);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `User does not exist` });
        }

        await database.remove(req.params.id);

        return res.status(StatusCodes.OK).json({ msg: `User deleted` });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error});
    }
});

userRouter.get("/users/search", async (req: Request, res: Response) => {
    try {
        const { name, email } = req.query;

        if (!name && !email) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide a name or an email for searching.' });
        }

        let users: UnitUser[] = [];

        if (name) {
            users = await database.findByUsername(name.toString());
        } else if (email) {
            users = await database.findByEmail(email.toString());
        }

        if (users.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json([]);
        }

        return res.status(StatusCodes.OK).json({ total_users: users.length, users });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error});
    }
});