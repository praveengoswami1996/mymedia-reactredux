import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { faker } from '@faker-js/faker';

// Below function is for the development purpose only...
const pause = (duration) => {
    return new Promise((resolve) => {
        setTimeout(resolve, duration)
    });
}

const albumsApi = createApi({
    reducerPath: 'albums',
    baseQuery: fetchBaseQuery(
        /* Configuration Object */
        {
            baseUrl: 'http://localhost:3005',
            //REMOVE fetchFn from production
            fetchFn: async (...args) => {
                await pause(1000);
                return fetch(...args);
            }
        }
    ),
    /* endpoints is a function, it is called automatically with an argument
       called builder. It returns an object that contains the detailed
       configuration of all the requests that we want to make.
    */
    endpoints(builder){
        /*
            The object that we return from the endpoints function is gonna
            have some keys (for example - fetchAlbums) and also some values
            along with them. Those keys will be used to generate the custom
            hook names. These custom hooks are automatically created by the
            api that we create.
            For example - In this example, fetchAlbums is being used to
            generate 'useFetchAlbumsQuery' hook.
        */
        return {
            fetchAlbums: builder.query({
                /* 
                Whenever you define provideTags as a function that function will
                automatically be called with couple of different arguments.
                The first argument will be result
                The second argument will be error
                The third argument will be user(arg)
                */
                providesTags: (result, error, user) => {
                    const tags = result.map(album => {
                        return { type: 'Album', id: album.id }
                    });
                    tags.push({ type: 'UsersAlbums', id: user.id });
                    return tags;
                },
                /*The 'user' parameter below is the same user that we
                are passing while calling 'useFetchAlbumsQuery' hook*/
                query: (user) => {
                    return {
                        url: '/albums',
                        params: {
                            userId: user.id,
                        },
                        method: 'GET', 
                    };
                }
            }),
            addAlbum : builder.mutation({
                invalidatesTags: (result, error, user) => {
                    return [{ type: 'UsersAlbums', id: user.id }]
                },
                query: (user) => {
                    return {
                        url: '/albums',
                        method: 'POST',
                        body: {
                            userId: user.id,
                            title: faker.commerce.productName()
                        },
                    };
                }
            }),
            removeAlbum: builder.mutation({
                invalidatesTags: (result, error, album) => {
                    return [{ type: 'Album', id: album.id }];
                },
                query: (album) => {
                    return {
                        url: `/albums/${album.id}`,
                        method: 'DELETE'
                    };
                }
            }),
        };
    }
});

export const { 
    useFetchAlbumsQuery, 
    useAddAlbumMutation,
    useRemoveAlbumMutation } = albumsApi;
//useFetchAlbumsQuery is an automatically generated hook by albumsApi.
export { albumsApi };

/*
    While calling createApi function we pass in a configuration object in
    which we write a "Ton of Configuration"
    
    Inside the Configuration object, we have to add three required 
    properties:
    **********************************************************************
    (i) reducerPath
    ----------------
    Description: When we create the api, it is automatically going to create
    a Slice behind the scenes, and we don't really have to interact with 
    that Slice in any way.
    The Slice is used to store a ton of state related to all the different
    requests that are being issued, the data they fetch, the status of those
    requests, error and so on.
    All these state(s) needs to be stored somewhere inside of our Redux Store.
    And we use the 'reducerPath' property to specify that.

    To hum jo bhi reducerPath property ki value rakhte hai, vo value hmare
    big state object mein ek property ban jati hai..
    Aur hmare big state object mein ye property hmari API ki sabhi state
    ko maintain karti hai..

    For example:
        if,
            reducerPath: 'albums'
    
    then Inside of our big state object (Notice the 'albums' property)

            _____________________________________________    
                                STATE
            _____________________________________________

            {
                users: {
                    isLoading: false,
                    error: null,
                    data: []
                },
                *****************************************
                albums: {
                    queries: { some stuff here..},
                    mutations: { some stuff here..},
                    provided: { some stuff here..},
                    subscriptions: { some stuff here..},
                    config: { some stuff here..},
                }
                *****************************************
            }
            ______________________________________________
    All these state inside of albums is added by the API to handle requests.
    However, we almost never need to interact with these properties (i.e. 
    queries, mutations, provided, subscriptions, config).

    Goal: The goal of 'reducerPath' is super simple. 'reducerPath' is just 
    used to specify where all the state (used by API to handle requests) is 
    going to be stored inside of our BIG state object. So, it basically
    specifies the key (for e.g. 'albums' in above case)

    **********************************************************************
    (ii) baseQuery
    ---------------
    Generally, we use axios for sending requests to server because its make
    sending requests to servers a little bit easier.

    Now by default, Redux Toolkit is gonna make requests for us on our behalf
    and rather than making use axios, Redux Toolkit will use fetch method
    (Function build directly into the browser to make requests) for making 
    requests.

    We could have also used fetch for making requests. The reason we did 
    not use fetch because fetch is a little bit awkward in some scenarios.
    
    And axios just makes the data fetching process a little bit easier.

    Redux Toolkit Query is going to use fetch by default.
    Thankfully, we don't need to deal with the awkward aspect of fetch,
    redux toolkit query is gonna handle them for us.

    The only thing that Redux Toolkit Query asks from us is that
    we have to give it some configuration which redux toolkit query will use
    to configure the fetch method.

    To Provide a configuration to Redux Toolkit Query, we will import a 
    function called 'fetchBaseQuery' from redux Toolkit.

    fetchBaseQuery is a function to make a pre-configured version of fetch.
    It will give back us a pre-configued version of fetch. 
    (A version of fetch that already has a couple of options assined to it.)

    We will take this pre-configured version of fetch and we will pass it to
    Redux Toolkit Query.

    The only configuation we have to pass in the configuration object is
    the 'baseURL'. We will only provide the baseURL in configuration object.

    The baseURL is the root URL of the server that we want to make the
    request to. (In this project it is 'http://localhost:3005')

    ***********************************************************************
    (iii) endpoints
    ---------------
    endpoints are little bit tedious to configure. We will follow a design
    process to configure endpoints.

    The goal of endpoints is to tell Redux Toolkit Query very explicitly
    "exactly how to make each of the requests that we want to make".
    So in other words, we want to tell to RTK Query,
    How it is going to fetch some data from server?
    How it is going to create some data on server?
    How it is going to delete some data on server?
    ______________________________________________________________________

                DESIGN PROCESS FOR CONFIGURING ENDPOINTS
    ______________________________________________________________________

    Step 1: What's the goal of each request that we want to make?
    
            In this project Goals are:
            1. I want to fetch a list of albums
            2. I want to create an album
            3. i want to remove an album

    Step 2: Give a simplified Name to goals

            1. fetchAlbums
            2. createAlbum
            3. removeAlbum

    Step 3: Is this request a query or a mutation??
        
        query: When we want to read data from the server, it is query.
        mutation: When we want to change data stored on the server, it is 
                  mutation.
            
            1. fetchAlbums (query)
            2. createAlbum (mutation)
            3. removeAlbum (mutation)
    
    Step 4: What's the 'path' for this request, relative to the 'baseURL'?

        1. /albums (i.e. http://localhost:3005/albums)        [fetchAlbums]
        2. /albums (i.e. http://localhost:3005/albums)        [createAlbum]
        3. /albums/userId (i.e. http://localhost:3005/albums) [removeAlbum]

    
    Step 5: What's the query string for this request??
        
        1. ?userId = userId     [fetchAlbums]
        2. - (No query string)  [createAlbum]
        3. - (No query string)  [removeAlbum]

    
    Step 6: What's the method for this request?

        1. GET                  [fetchAlbums]
        2. POST                 [createAlbum]
        3. DELETE               [removeAlbum]
    
    
    Step 7: What's the body for this request?
        
        1. -                  [fetchAlbums]
        2. {title, userId}    [createAlbum]
        3. -                  [removeAlbum]

    ***********************************************************************
*/