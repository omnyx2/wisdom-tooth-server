import jwt from 'jsonwebtoken'
interface JwtObj { 
  secret: string;
}

// interface JwtObj { 
//     access: Promise<string>,
//     refresh: Promise<string>
// }

export const jwtObj: JwtObj = {
    secret : process.env.ACCESS_TOKEN_SECRET || "apple"
};

export const getToken = () => {
  return {
    access(id){
      return jwt.sign({id}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
      });
    },
    refresh(id){
      return jwt.sign({id}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "180 days",
      });
    }
  }

}

