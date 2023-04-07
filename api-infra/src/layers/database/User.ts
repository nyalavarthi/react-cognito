/**
 * Sample database class shows how to use layers in Lambda
 */
interface User {
  name: string;
  id: number;
}

/**
 * Sample class
 */
export const user: User = {
  name: "John Doe",
  id: 0,
};