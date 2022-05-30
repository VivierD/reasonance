import { useState, useEffect } from 'react' ;
import { Box, Typography, IconButton, AppBar, Toolbar, FormControl, FormGroup, FormControlLabel, Switch, InputLabel, MenuItem, Button, Select, } from '@mui/material' ;
import { makeStyles, useTheme } from '@mui/styles' ;
import Fade from '@mui/material/Fade' ;
import MenuRoundedIcon from '@mui/icons-material/MenuRounded' ;
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded' ;
import ClearRoundedIcon from '@mui/icons-material/ClearRounded' ;
import Muse from '../modules/muse.js' ;
import { select } from 'd3';

const useStyles = makeStyles((theme) => ({

    containerBox : {
        position : 'fixed',
        bottom : '0px',
        left : '0px',
        width : '100%',
        height : '10%',
        backgroundColor : theme.palette.background.primary,
    },

    appBar : {
        backgroundColor : theme.palette.background.primary,
        transition : '5s ease'
    },
    menuBurger : {
        position : 'fixed',
        bottom : '20px',
        right : '20px',
        transition : '5s ease'
    },
}))

const BottomMenu = ( {  selectedIndividualMetric, individualMetrics, handleSelectedIndividualMetricChange, hidden, onLeftDataChange, onRightDataChange, onMetricChange, onGamePlayChange, isVisible, handleIsVisible } ) => {

    const theme = useTheme() ;
    const classes = useStyles(theme) ;

    const [ isHidden, setIsHidden ] = useState( (hidden === undefined) ? true : hidden) ;

    const [ isLeftBrainDeviceConnected, setIsLeftBrainDeviceConnected ] = useState(false) ;
    const [ leftBrainData, setLeftBrainData ] = useState(undefined) ;
    const leftBrainDevice = new Muse(setIsLeftBrainDeviceConnected, setLeftBrainData) ;

    const [ isRightBrainDeviceConnected, setIsRightBrainDeviceConnected ] = useState(false) ;
    const [ rightBrainData, setRightBrainData ] = useState(undefined) ;
    const rightBrainDevice = new Muse(setIsRightBrainDeviceConnected, setRightBrainData) ;

    const [ isStreaming, setIsStreaming ] = useState(false) ;
    const handleIsStreamingChange = ( event ) => {
        setIsStreaming(old => !old) ;
    }

    const [ bleError, setBleError ] = useState(false) ;

    useEffect( () => {
        onGamePlayChange(isStreaming) ;
    }, [ isStreaming])

    useEffect( () => {
        onMetricChange(selectedIndividualMetric) ;
    }, [ selectedIndividualMetric ]) 

    useEffect( () => {

        if (leftBrainData !== undefined)
        {
            onLeftDataChange(leftBrainData) ;
        }

    }, [ leftBrainData ])

    useEffect( () => {

        if (rightBrainData !== undefined)
        {
            onRightDataChange(rightBrainData) ;
        }

    }, [ rightBrainData ])


    const connectLeftBrainDevice = () => {
        navigator.bluetooth === undefined ?
            setBleError(true)
        :
            leftBrainDevice.connexion() ;
    }

    const connectRightBrainDevice = () => {
        navigator.bluetooth === undefined ?
            setBleError(true)
        :
            rightBrainDevice.connexion() ;
    }
if(selectedIndividualMetric === 'Flow' || selectedIndividualMetric === 'Deep' || selectedIndividualMetric === 'Concentration' || selectedIndividualMetric === 'Calme'){
    return (
        <div className = { classes.containerBox } >
            <Box className = {classes.menuBurger} style = {{ display : isHidden ? 'block' : 'none'}} >
                <IconButton sx = {{ float : 'right'}} color = "primary" onClick = { () => { setIsHidden(false ) } }>
                    <MenuRoundedIcon />
                </IconButton>
            </Box>

            <Box className = { classes.containerBox } sx = {{display : !isHidden ? 'block' : 'none'}}>
                <AppBar style = {{ backgroundColor : theme.palette.background.primary }} elevation = { 0 } sx = {{ borderTop : "1px #dedede solid"  }} position = "static" className = { classes.appBar }>
                    <Toolbar style = {{ display : 'flex', flexDirection : 'row', justifyContent : 'space-evenly' }}>
                        <Box sx = {{ width : '20%', display : 'flex', flexDirection : 'row', justifyContent : 'center', flexWrap : 'nowrap' }}>
                            <IconButton  sx = {{ padding : 0, marginLeft : 2 }} aria-label = "tribe-management" component = "span" onClick = { () => { connectLeftBrainDevice() ; } }>
                                <PsychologyRoundedIcon color = { isLeftBrainDeviceConnected ? 'connectedleft' : 'disconnectedleft' } />
                            </IconButton>
                        </Box>

                        <FormControl sx = {{ width : '30%', display : 'flex', flexDirection : 'row', justifyContent : 'center', flexWrap : 'nowrap' }} component = "fieldset" variant = "standard">
                                <FormControlLabel
                                    control = {
                                        <Switch
                                            checked = { isVisible }
                                            onClick = { handleIsVisible }
                                            inputProps = {{ 'aria-label': 'controlled' }}
                                        />
                                    }
                                    label = {<Typography color = 'secondary'>{ isVisible ? "Avec Metric" : "Sans Metric"}</Typography>}
                                />
                        </FormControl>

                        <FormControl sx = {{ width : '30%', display : 'flex', flexDirection : 'row', justifyContent : 'center', flexWrap : 'nowrap' }} component = "fieldset" variant = "standard">
                            <FormGroup>
                                <FormControlLabel
                                    control = {
                                        <Switch
                                            checked = { isStreaming }
                                            onChange = { handleIsStreamingChange }
                                            inputProps = {{ 'aria-label': 'controlled' }}
                                        />
                                    }
                                    label = {<Typography color = 'secondary'>{ isStreaming ? "Finir" : "Commencer"}</Typography>}
                                />
                            </FormGroup>
                        </FormControl>



                        <FormControl variant = "standard" sx = {{ width : '30%', display : 'flex', flexDirection : 'column', justifyContent : 'center', flexWrap : 'nowrap'  }}>
                            <InputLabel id = "select-individual-metric">{<Typography color = 'secondary'>Metric</Typography>}</InputLabel>
                            <Select
                                title='Choisissez votre mode de metric'
                                color = 'secondary'
                                labelId = "select-individual-metric"
                                value = { selectedIndividualMetric }
                                onChange = { handleSelectedIndividualMetricChange }
                                label = "Select your individual metric"
                            >
                                <MenuItem value = "None">
                                    <Typography color = 'secondary'>Aucune</Typography>
                                </MenuItem>
                                {
                                    individualMetrics.map( (item, index ) => {
                                        return(
                                            <MenuItem key = { "individual-metric-" + index } value = { item.name } title= {item.title} >
                                                <Typography color = 'secondary'>{item.name}</Typography>
                                            </MenuItem>
                                        )
                                    })
                                }
                            </Select>
                        </FormControl>

                        <Box sx = {{ width : '20%', display : 'flex', flexDirection : 'row', justifyContent : 'center', flexWrap : 'nowrap' }}>
                            <IconButton  sx = {{ padding : 0, marginLeft : 2 }} aria-label = "tribe-management" component = "span" onClick = { () => { connectRightBrainDevice() ; } }>
                                <PsychologyRoundedIcon color = { isRightBrainDeviceConnected ? 'connectedright' : 'disconnectedright' } />
                            </IconButton>
                        </Box>

                    </Toolbar>
                </AppBar>
            </Box>
        </div>
    

    )
}
else{
    return(
        <div className = { classes.containerBox } >
            <Box className = {classes.menuBurger} style = {{ display : isHidden ? 'block' : 'none'}} >
                <IconButton sx = {{ float : 'right'}} color = "primary" onClick = { () => { setIsHidden(false ) } }>
                    <MenuRoundedIcon />
                </IconButton>
            </Box>

            <Box className = { classes.containerBox } sx = {{display : !isHidden ? 'block' : 'none'}}>
                <AppBar style = {{ backgroundColor : theme.palette.background.primary }} elevation = { 0 } sx = {{ borderTop : "1px #dedede solid"  }} position = "static" className = { classes.appBar }>
                    <Toolbar style = {{ display : 'flex', flexDirection : 'row', justifyContent : 'space-evenly' }}>


                        <FormControl variant = "standard" sx = {{ width : '30%', display : 'flex', flexDirection : 'column', justifyContent : 'center', flexWrap : 'nowrap'  }}>
                            <InputLabel id = "select-individual-metric">{<Typography color = 'secondary'>Metric</Typography>}</InputLabel>
                            <Select
                                title='Choisissez votre mode de metric'
                                color = 'secondary'
                                labelId = "select-individual-metric"
                                value = { selectedIndividualMetric }
                                onChange = { handleSelectedIndividualMetricChange }
                                label = "Select your individual metric"
                            >
                                <MenuItem value = "None">
                                    <Typography color = 'secondary'>Aucune</Typography>
                                </MenuItem>
                                {
                                    individualMetrics.map( (item, index ) => {
                                        return(
                                            <MenuItem key = { "individual-metric-" + index } value = { item.name } title= {item.title} >
                                                <Typography color = 'secondary'>{item.name}</Typography>
                                            </MenuItem>
                                        )
                                    })
                                }
                            </Select>
                        </FormControl>

                    </Toolbar>
                </AppBar>
            </Box>
        </div>    
        
    )
}
                            
}



export default BottomMenu;