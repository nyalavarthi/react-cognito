import create from 'zustand'
import { persist } from "zustand/middleware"

const UserStore = create(persist(
  (set, get) => ({
    customer: [],
    setCustomer: (customer) =>
      set((prevState) => ({
        //customer: [...prevState.answers, answer] 
        customer: [{ name: customer.name, id: customer.id },]
      }
      ), console.log('session setCustomer called ', customer)),
    user: {},
    //,
    setUser: (user) =>
      set((state) => ({
        user:
          { name: user.name, groups: user.groups, loggedIn: user.loggedIn },
      }
      ),  console.log('session setUser called ', user)),
  }),
  {
    name: "user-storage", // unique name
    getStorage: () => sessionStorage, // (optional) by default the 'localStorage' is used
  }
))

export default UserStore;