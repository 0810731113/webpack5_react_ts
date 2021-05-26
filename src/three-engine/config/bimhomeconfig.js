const config_dev = {
    BimfaceUrl: 'https://api.bimface.com',
    GJWUrl: 'https://www-dev.goujianwu.com',
    GJWStaticUrl: 'https://static-test.goujianwu.com',
    GJWApiUrl: 'https://api-dev.goujianwu.com',
    ClashUrl: 'http://10.4.35.43:8088',
    //CdgUrl: 'https://gdc-te.glodon.com/bimmodel',
    CdgUrl: 'https://gdc-de.glodon.com/bimmodel',
    BimcodeUrl: 'https://gdc-de.glodon.com/bimcode',
    Bfproxy: 'https://gdc-de.glodon.com/bfproxy',
    StoreUrl: 'https://gdc-de.glodon.com/store',
    StructureUrl: 'https://gdc-de.glodon.com/structure'
    //StructureUrl: 'http://10.4.35.68:8020/structure'
};

const config = {

    Dev: {
        BimfaceUrl: 'https://api.bimface.com',
        GJWUrl: 'https://www-dev.goujianwu.com',
        GJWStaticUrl: 'https://static-test.goujianwu.com',
        GJWApiUrl: 'https://api-dev.goujianwu.com',
        ClashUrl: 'http://10.4.35.43:8088',

        CdgUrl: 'https://apigate-test.glodon.com/gdc-de/bimmodel',
        // CdgUrl: 'https://gdc-de.glodon.com/bimmodel',
        BimcodeUrl: 'https://gdc-de.glodon.com/bimcode',
        Bfproxy: 'https://gdc-de.glodon.com/bfproxy',
        StoreUrl: 'https://gdc-de.glodon.com/store',
        StructureUrl: 'https://gdc-de.glodon.com/structure'
    },

    QA: {
        BimfaceUrl: 'https://api.bimface.com',
        GJWUrl: 'https://www.goujianwu.com',
        GJWStaticUrl: 'https://static.goujianwu.com',
        GJWApiUrl: 'https://api.goujianwu.com',
        ClashUrl: 'https://mep-qa.glodon.com/ClashDetection',

        CdgUrl: 'https://gdc-qa.glodon.com/bimmodel',
        BimcodeUrl: 'https://gdc-qa.glodon.com/bimcode',
        Bfproxy: 'https://gdc-qa.glodon.com/bfproxy',
        StoreUrl: 'https://gdc-qa.glodon.com/store',
        StructureUrl: 'https://gdc-qa.glodon.com/structure'
    },

    Prod: {
        BimfaceUrl: 'https://api.bimface.com',
        GJWUrl: 'https://www.goujianwu.com',
        GJWStaticUrl: 'https://static.goujianwu.com',
        GJWApiUrl: 'https://api.goujianwu.com',
        ClashUrl: 'https://mep-prod.glodon.com/ClashDetection',

        CdgUrl: 'https://gdc-prod.glodon.com/bimmodel',
        BimcodeUrl: 'https://gdc-prod.glodon.com/bimcode',
        Bfproxy: 'https://gdc-prod.glodon.com/bfproxy',
        StoreUrl: 'https://gdc-prod.glodon.com/store',
        StructureUrl: 'https://gdc-prod.glodon.com/structure'
    }

};

let env = WEBPACK_ENV ? WEBPACK_ENV : 'Dev';
console.log('webpack_env: ', WEBPACK_ENV);
const bimhomeConfig = process.env.NODE_ENV === 'production' ? config[env] : config_dev;

export default bimhomeConfig;