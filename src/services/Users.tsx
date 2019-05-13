import { getWSService } from './WebSocket';
interface UserType {
  username: string
  room: string
  joined? : Date
  last_active? : Date
}

let UserService: Users | null = null;

/**
 *  User class to maintain user state
 * 
 *  TODO: 
 *  - Add call to API to check username availability
 *  
 */
class Users {

  private userList : [UserType]
  private socketConnection : WebSocket | null
  constructor(){
    this.userList = [{
      username: '',
      room: ''
    }];
    this.socketConnection = null;
  }
  /**
   *  Add a new user to the room and initiate WebSocket connection
   *  @param user User object
   *  @returns Status string
   */
  addUser = (user: UserType): boolean => {
    console.log('In add user ', user.username);
    if(this.checkUsername(user.username)){
      const userVal = {
        username: user.username,
        room: user.room,
        joined: new Date(),
        last_active: new Date() 
      };
      this.userList.push(userVal);
       
       //Initiate the WebSocket connection for the user
       this.socketConnection = getWSService();
       const timeout = setTimeout(() => {
         console.log('In timeout callback');
         console.log(this.socketConnection);
         if(this.socketConnection){
          console.log('Sending message');
          //Add user details to Mongo DB
          getWSService().sendMessage("useradd", userVal);
        }
       }, 3000);       
       return true;
    }else{
      return false;
    }
    
  }

  /**
   *  Remove a user from a room 
   *  @param user User object
   */
  removeUser = (user: UserType): void => {
    const userIndex = this.userList.findIndex((userObj: UserType) => {
      return user.username === userObj.username && user.room === userObj.room;
    });

    if(userIndex){
      delete this.userList[userIndex];
    }else{
      console.log('User not found!');
    }
  }

  /**
   *  Checks if user name exists, across rooms
   *  @param username
   *  @todo Change this to an API call
   */
  checkUsername = (username: string): boolean => {
    const userIndex = this.userList.findIndex((userObj: UserType) => {
      return username === userObj.username;
    });
    console.log(`User name index returned ${userIndex}`);
    if(userIndex >= 0) return false;

    return true;
  }

  /**
   *  Get total user count
   *  @param room Specific room to get count for
   */
  getUserCount = (room: string): number => {
    let totalCount = 0;
    if(room){
      this.userList.forEach(user => {
        if(user.room === room){
          totalCount += 1;
        }
      });
      return totalCount;
    }
    return this.userList.length;
  }

  /**
   *  Get Users for a room
   *  @param room
   */
  getUserList = (room: string): UserType[] => {
    let finalList = [];
    if(room){
      finalList = this.userList.filter(user => {
        if(user.room === room){
          return user;
        }
      });      
      return finalList;
    }
    return this.userList;
  }

  static initUserService = (): Users => {
    if(!UserService){
      UserService = new Users();
      return UserService;
    }    
    return UserService;
  }
}

export const getUserService = Users.initUserService;
