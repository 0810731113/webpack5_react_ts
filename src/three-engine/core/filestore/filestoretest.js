import {FileStoreHelper} from './filestorehelper';
import JSM from '../extension/jsmodeler';

class FileStoreTest
{
    static testFileStoreHelperBasic()
    {
        FileStoreHelper.DefaultFileStoreHelper.healthProbe()
            .then(res=>console.log(JSON.stringify(res)));

        FileStoreHelper.DefaultFileStoreHelper.newFile('test','test')
            .then(res=>console.log(JSON.stringify(res)));

        FileStoreHelper.DefaultFileStoreHelper.getFile('test','test','1551951437921000')
            .then(res=>console.log(JSON.stringify(res)));

        FileStoreHelper.DefaultFileStoreHelper.saveFile('test','test','hello world!')
            .then(res=>console.log(JSON.stringify(res)));

        FileStoreHelper.DefaultFileStoreHelper.readFile('test','test','1552010783848999')
            .then(res=>console.log(JSON.stringify(res)));

        FileStoreHelper.DefaultFileStoreHelper.readPathFile('/thumbnail/chair7.obj/1552559099877000')
            .then(res=>console.log(JSON.stringify(res)));
    }

    static testPerf(){
        let startTime = Date.now();
        let urls = ['https://bimhome-public-test.oss-cn-shanghai.aliyuncs.com/asset_target/1681122873274144_99_6291e7ee-acad-4707-ba71-60d3a4668f86/obj/item.obj',
        'https://bimhome-public-test.oss-cn-shanghai.aliyuncs.com/asset_target/1689638162056064_99_97181634-6d78-424a-b376-f78402c380f0/obj/item.obj',
        'https://bimhome-public-test.oss-cn-shanghai.aliyuncs.com/asset_target/1689630344147424_99_f89ad36a-66ba-403b-92ee-0274e1235de5/obj/item.obj',
        'https://bimhome-public-test.oss-cn-shanghai.aliyuncs.com/1666902974286432/mtl-ext/e8a35225-868f-4ad3-bbaf-1c7629b04768.jpg',
        'https://bimhome-public-test.oss-cn-shanghai.aliyuncs.com/asset_target/1689636013240800_99_0ec5921d-c385-4d60-9939-7a3663154968/obj/item.obj',
        'https://bimhome-public-test.oss-cn-shanghai.aliyuncs.com/asset_target/1689628102652384_99_0bf38d6f-3ba4-480a-b657-c64e21198e82/obj/item.obj',
        'https://bimhome-public-test.oss-cn-shanghai.aliyuncs.com/1666898878507616/mtl-ext/b300dff0-55b9-41ab-b472-eab5215710ab.jpg',
        'https://bimhome-public-test.oss-cn-shanghai.aliyuncs.com/1670679672076960/preview/1d3f2045-2a51-4eeb-bfc1-196c51cd9eee.jpg',
        'https://bimhome-public-test.oss-cn-shanghai.aliyuncs.com/asset_target/1689694247134112_99_72015ee5-733f-47ce-b027-0506de0ba055/obj/item.obj',
        'https://bimhome-public-test.oss-cn-shanghai.aliyuncs.com/asset_target/1689694247134112_99_72015ee5-733f-47ce-b027-0506de0ba055/obj/item.obj',
        'https://bimhome-public-test.oss-cn-shanghai.aliyuncs.com/asset_target/1689606740636128_99_6963cb4b-d9ee-488f-a1e5-6aceaf54a6db/obj/item.obj'];// 4.6M
        for(let j=0;j<1;j++) {
            for (let i = 0; i < 100; i++) {
                urls.forEach((url)=> {
                    FileStoreHelper.readFilePathDirectly(url, 'text').then(res => {
                        // if(url.endsWith('obj')){
                        //     let objectData = JSM.ConvertObjToJsonData(res, {
                        //     });
                        // }
                        let responseTime = Date.now() - startTime;
                        console.log(`used :${responseTime} ms`);
                    })
                });
            }
        }
    }
}

export { FileStoreTest };