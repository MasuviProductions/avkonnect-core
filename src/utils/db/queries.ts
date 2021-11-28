import User, { IUser } from '../../models/user';

const getUser = async (id: string, email: string): Promise<IUser | undefined> => {
    const userDocument = await User.get({
        id: id,
        email: email,
    });
    if (!userDocument) {
        return;
    }
    const user: IUser = {
        id: userDocument.id,
        connectionIds: userDocument.connectionIds,
        dateOfBirth: userDocument.dateOfBirth,
        displayPicture: userDocument.displayPicture,
        email: userDocument.email,
        followerIds: userDocument.followerIds,
        followingIds: userDocument.followingIds,
        preferences: userDocument.preferences,
    };
    return user;
};

const createUser = async (user: IUser): Promise<IUser | undefined> => {
    const myUser = new User(user);
    await myUser.save();
    return user;
};

export const DBQueries = { createUser, getUser };
