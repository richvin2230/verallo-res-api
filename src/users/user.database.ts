import {User, UnitUser, Users} from "./user.interface";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const USERS_FILE_PATH = "./users.json";

let users: Users = loadUsers();

function loadUsers(): Users {
    try {
        const data = fs.readFileSync(USERS_FILE_PATH, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Error loading users: ${error}`);
    }
}

function saveUsers() {
    try {
        fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users), "utf-8");
        console.log(`Users saved successfully!`);
    } catch (error) {
        throw new Error(`Error saving users: ${error}`);
    }
}

export const findAll = async (): Promise<UnitUser[]> => Object.values(users);

export const findOne = async (id: string): Promise<UnitUser | undefined> => users[id];

export const create = async (userData: UnitUser): Promise<UnitUser> => {
    const id = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user: UnitUser = {
        id,
        username: userData.username,
        email: userData.email,
        password: hashedPassword
    };

    users[id] = user;

    saveUsers();

    return user;
};

export const findByEmail = async (email: string): Promise<UnitUser[]> => {
    const allUsers = await findAll();
    const filteredUsers = allUsers.filter(user => user.email.toLowerCase().includes(email.toLowerCase()));
    return filteredUsers;
};

export const comparePassword = async (email: string, supplied_password: string): Promise<UnitUser | null> => {
    const usersWithEmail = await findByEmail(email.toLowerCase());
    const user = usersWithEmail[0]; // Assuming email is unique

    if (!user) {
        return null;
    }

    const isPasswordValid = await bcrypt.compare(supplied_password, user.password);

    return isPasswordValid ? user : null;
};

export const update = async (id: string, updateValues: User): Promise<UnitUser | null> => {
    const userToUpdate = await findOne(id);

    if (!userToUpdate) {
        return null;
    }

    if (updateValues.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updateValues.password, salt);
        updateValues.password = hashedPassword;
    }

    const updatedUser: UnitUser = { ...userToUpdate, ...updateValues };
    users[id] = updatedUser;

    saveUsers();

    return updatedUser;
};

export const remove = async (id: string): Promise<void> => {
    delete users[id];
    saveUsers();
};

export const findByUsername = async (username: string): Promise<UnitUser[]> => {
    const allUsers = await findAll();
    const filteredUsers = allUsers.filter(user => user.username.toLowerCase().includes(username.toLowerCase()));
    return filteredUsers;
};