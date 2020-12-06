import {IUser} from "./src/models/User";

declare namespace Express{
    export interface Request{
        user?: IUser;
    }
}