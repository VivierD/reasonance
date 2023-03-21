import { useState, useEffect } from 'react' ;
import { Typography, TextField, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material' ;
import { getFirestore, collection, doc, addDoc, setDoc, updateDoc, getDoc, query, where, limit, getDocs, onSnapshot, serverTimestamp, arrayUnion, arrayRemove, increment, deleteDoc } from "firebase/firestore" ;
import { useFirebase, isEmpty, isLoaded } from 'react-redux-firebase' ;
import { useSelector } from "react-redux" ;

const CreateTribeDialog = ( { status, onClose, children } ) => {

    const db = getFirestore() ;
    const firebase = useFirebase() ;
    const auth = useSelector(state => state.firebase.auth) ;
    const [ isLogged, setIsLogged ] = useState(false) ;

    const [ uid, setUid ] = useState(undefined) ;
    const [ userDoc, setUserDoc ] = useState(undefined) ;
    const [ username, setUsername ] = useState(undefined) ;

    useEffect(() => {
        if (!isEmpty(auth) && isLoaded(auth))
        {
            setIsLogged(true) ;
            setUid(auth.uid) ;
        }
        else
        {
            setIsLogged(false) ;
            setUid(undefined) ;
            setUsername(undefined) ;
        }
    }, [ auth ])

    useEffect( () => {
        if (uid !== undefined)
        {
            setUserDoc(doc(db, "Users", uid)) ;
        }
    }, [ uid ])

    useEffect(() => {
        if (userDoc !== undefined)
        {
            getDoc(userDoc)
            .then( docSnap => {
                setUsername(docSnap.data().metadata.username) ;
            })
        }
    }, [ userDoc ])

    useEffect( () => {
        if (status === true)
        {
            handleCreateTribeOpen() ;
        }
    }, [ status ])

    const [ dialogCreateTribeOpen, setDialogCreateTribeOpen ] = useState(false) ;
    const handleCreateTribeOpen = () => {
        setDialogCreateTribeOpen(true) ;
    }
    const handleCreateTribeClose = () => {
        onClose(false) ;
        setDialogCreateTribeOpen(false) ;
        setTribeNameToCreateErrorMessage("") ;
        setNewTribeNameToCreate("") ;
    }

    const [ newTribeNameToCreate, setNewTribeNameToCreate ] = useState("") ;
    const handleFieldTribeNameToCreateChange = ( event ) => {
        setNewTribeNameToCreate(event.target.value) ;
    }
    const [ tribeNameToCreateError, setTribeNameToCreateError ] = useState(false) ;
    const [ tribeNameToCreateErrorMessage, setTribeNameToCreateErrorMessage ] = useState("") ;
    const handleSubmitNewTribeToCreate = () => {

        const tribeDict = doc(db, "Dicts", "Tribes") ;
        getDoc(tribeDict)
        .then(docSnap => {
            if (!docSnap.exists())
            {
                CreateNewTribe(newTribeNameToCreate) ;
            }
            else
            {
                if (docSnap.data().names !== undefined && docSnap.data().names.includes(newTribeNameToCreate))
                {
                    setTribeNameToCreateErrorMessage("This tribe already exists. Please use another tribe name.") ;
                }
                else
                {
                    CreateNewTribe(newTribeNameToCreate) ;
                }
            }
        })
    }

    const CreateNewTribe = ( tribeName ) => {

        addDoc(collection(db, "Tribes"), {
            tribename : tribeName,
            createdAt : new Date(),
            admin : {
                username : username,
                uid : uid
            },
            members : [ {
                username : username,
                uid : uid
            }]
        })
        .then( docRef => {
            const tribeDict = doc(db, "Dicts", "Tribes") ;
            getDoc(tribeDict)
            .then(docSnap => {
                if (!docSnap.exists())
                {
                    setDoc(tribeDict, {
                        names : [ tribeName ],
                        uids : [ docRef.id ],
                        tribes : [{
                            name : tribeName,
                            uid : docRef.id
                        }]
                    })
                    .then( () => {
                        updateDoc(userDoc, {
                            tribesasadmin : arrayUnion({
                                name : tribeName,
                                uid : docRef.id
                            }),
                            tribesasmember  : arrayUnion({
                                name : tribeName,
                                uid : docRef.id
                            })
                        })
                        .then( () => {
                            handleCreateTribeClose() ;
                        })
                    })
                }
                else
                {
                    updateDoc(tribeDict, {
                        names : arrayUnion(tribeName),
                        uids : arrayUnion(docRef.id),
                        tribes : arrayUnion({
                            name : tribeName,
                            uid : docRef.id
                        })
                    })
                    .then( () => {
                        updateDoc(userDoc, {
                            tribesasadmin : arrayUnion({
                                name : tribeName,
                                uid : docRef.id
                            }),
                            tribesasmember  : arrayUnion({
                                name : tribeName,
                                uid : docRef.id
                            })
                        })
                        .then( () => {
                            handleCreateTribeClose() ;
                        })
                    })
                }
            })
            .then( () => {
                handleCreateTribeClose() ;
                setTribeNameToCreateErrorMessage("") ;
                setNewTribeNameToCreate("") ;
            })
        })
    }

    return (
        <div>
            <Dialog open = { dialogCreateTribeOpen } onClose = { handleCreateTribeClose }>
                <DialogTitle>Create a new tribe</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the name of your new tribe
                    </DialogContentText>
                    <TextField
                        margin = "dense"
                        id = "tribenametocreate"
                        name = "tribenametocreate"
                        label = "Your tribe name"
                        type = "username"
                        fullWidth
                        required
                        value = { newTribeNameToCreate }
                        onChange = { handleFieldTribeNameToCreateChange }
                        variant = "standard"
                        error = { tribeNameToCreateError }
                    />
                    {
                        tribeNameToCreateErrorMessage ? (
                            <Typography color = "error">{tribeNameToCreateErrorMessage}</Typography>
                        ) : null
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick = { handleCreateTribeClose }>Cancel</Button>
                    <Button autoFocus onClick = { handleSubmitNewTribeToCreate }>Send</Button>
                </DialogActions>
            </Dialog>
            { children }
        </div>
    )
}

export default CreateTribeDialog ;