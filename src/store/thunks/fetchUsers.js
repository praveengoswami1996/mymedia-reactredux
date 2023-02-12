import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const fetchUsers = createAsyncThunk('users/fetch', async () => {
    const response = await axios.get('http://localhost:3005/users');

    await pause(1000);

    return response.data
});

// Below function is for development purpose only...
const pause = (duration) => {
    return new Promise((resolve) => {
        setTimeout(resolve, duration)
    });
}


export { fetchUsers };

/*
    Here, 'users/fetch' is a base-type.
    base-type can be any string that we want but usually it is some string
    that makes sense. 
    We provide this base-type to Async Thunk Function as the first argument.
    
    Async Thunk Function uses this base-type for creating an action-type
    for the action object that it automatically dispatches during the 
    data loading/fetching process.
    
    For Example:
    When we first make the request for data fetching to the server, At that
    time Async Thunk Function automatically dispatches an action object and
    type of this action object is generated with the help of base-type we 
    provide to it.
    So, the action-type when we make our request will be something like:

                'users/fetch/pending' (pending is added by async thunk)

    Similarly, if the request is successful and we successfully fetched the
    data, the action-type in that case will be something like:

                'users/fetch/fulfilled' (fulfilled is added by async thunk)

    And if there was an error in data fetching then the action-type of the
    action object dispatched by the Async Thunk Function will be something
    like:
                'users/fetch/rejected' (rejected is added by async thunk)
    
*/

/*
    When we create the thunk, the variable which is storing the thunk
    function (in above example of thunk function that variable is 
    'fetchUsers') is automatically going to have three properties assigned
    to it.
        1. fetchUsers.pending
           ( fetchUsers.pending === 'users/fetch/pending')
        2. fetchUsers.fulfilled
           ( fetchUsers.fulfilled === 'users/fetch/fulfilled')
        3. fetchUsers.rejected
           ( fetchUsers.rejected === 'users/fetch/rejected')
    
    What is the use of this?
    Answer => In our slice, when we create the extraReducers for handling 
        the action-type dispatched by the thunk function during the data
        fetching/loading process, in that situation instead of writing the
        hard-coded action-type in the builder.addCase(),

        For example : builder.addCase('users/fetch/pending', reducerFunction)

        we can write in above manner to avoid the hard-coded strings

        For example: builder.addCase(fetchUsers.pending, reducerFunction)
*/