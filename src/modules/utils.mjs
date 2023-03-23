const MuseInfo = {
    primaryService : 0xfe8d,
    characteristics : [
        { type : 'electrode', name : 'tp9', uid : '273e0003-4c4d-454d-96be-f03bac821358'},
        { type : 'electrode', name : 'af7', uid : '273e0004-4c4d-454d-96be-f03bac821358'},
        { type : 'electrode', name : 'af8', uid : '273e0005-4c4d-454d-96be-f03bac821358'},
        { type : 'electrode', name : 'tp10', uid : '273e0006-4c4d-454d-96be-f03bac821358'},
        { type : 'connector', name : 'connector', uid : '273e0001-4c4d-454d-96be-f03bac821358'},
    ]
}

const MuseDeviceOptions = {
    filters : [
        { namePrefix : 'Muse' },
    ],
    optionalServices : [
        MuseInfo.primaryService,
    ]
}

const HeartManagerInfo = {
    primaryService : '0000180d-0000-1000-8000-00805f9b34fb',
    characteristic : '00002a37-0000-1000-8000-00805f9b34fb',
}

const HeartManagerDeviceOptions = {
    filters : [
        { services: [ HeartManagerInfo.primaryService ] }
    ],
}

export { MuseInfo, MuseDeviceOptions, HeartManagerInfo, HeartManagerDeviceOptions }

// UUID 0000fec0-0000-1000-8000-00805f9b34fb found in Service with UUID 0000fec0-0000-1000-8000-00805f9b34fb.
// No Characteristics matching UUID d287a46d-df14-9b2a-f70e-360156dcd627 found in Service with UUID 0000fec0-0000-1000-8000-00805f9b34fb.