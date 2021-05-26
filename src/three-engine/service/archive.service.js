import { archiveapi } from "@/request/bimmodel/archiveapi";
import { versionapi } from "@/request/bimmodel/versionapi";
import { teamapi } from "@/request/bimmodel/teamapi";


const ArchiveData = {

    async getPackageVersionInfo(packageId, versionId) {

        const result = [];

        if (packageId && versionId) {
            let obj = await archiveapi.getPackageVersion(packageId, versionId);

            if (obj.content) {

                let versionIds = obj.content.filter((record) => record.type === 'Version').map((record) => record.resourceId);
                if (versionIds && versionIds.length > 0) {

                    let versions = await versionapi.getBatchVersions(versionIds);

                    let dsIds = versions.map((version) => version.dataSetId);
                    let datasets = await versionapi.getBatchDatasets(dsIds);
                    let teams = await teamapi.findTeamsByDsIds(dsIds);

                    versions.forEach((version) => {

                        let team = teams.find(team => team.dsId === version.dataSetId);

                        result.push({
                            dsInfo: datasets.find((ds) => ds.id === version.dataSetId),
                            vsInfo: version,
                            teamInfo: team ? team.teamVO : null,
                            key: version.id
                        })
                    })
                }
            }

            return result;
        }
    },


    async getAllPackagesVersions(projectId) {
        let packages = await archiveapi.getAllArchivesByProjectId(projectId);

        let promises = []
        packages.forEach((archivePackage) => {
            let p = archiveapi.getArchiveVersionsByPackageId(archivePackage.id).then((versions) => {
                archivePackage.versions = versions;
                archivePackage.selVersion = versions.length > 0 ? versions[versions.length - 1] : null;
            });
            promises.push(p)
        })

        await Promise.all(promises)
        return packages;
    }
}

export { ArchiveData }