import User, { IUser } from '../../models/user';

const getUser = async (id: string, email: string): Promise<IUser | undefined> => {
    const userDocument = await User.scan({
        email: email,
    }).exec();
    if (!userDocument[0]) {
        return;
    }
    const fetchedUser = userDocument[0];
    const user: IUser = {
        id: fetchedUser.id,
        connectionIds: fetchedUser.connectionIds,
        dateOfBirth: fetchedUser.dateOfBirth,
        displayPicture: fetchedUser.displayPicture,
        email: fetchedUser.email,
        followerIds: fetchedUser.followerIds,
        followingIds: fetchedUser.followingIds,
        name: fetchedUser.name,
        preferences: fetchedUser.preferences,
    };
    return user;
};

const createUser = async (user: IUser): Promise<IUser | undefined> => {
    const myUser = new User(user);
    await myUser.save();
    return user;
};

export const DBQueries = { createUser, getUser };
