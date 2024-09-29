const fs = require('fs');

// Leer el archivo JSON
const rawData = fs.readFileSync('c:/division-territorial-2021.json');
const locations = JSON.parse(rawData);

// Estructura para almacenar los datos jerárquicamente
const provincias = [];
const municipios = [];
const distritoMunicipales= [];
const sectores= [];
const barrios= [];
const subbarrios= [];


function crearProvincias() {
    for (const location of locations) {
        const { Provincia, Municipio, DistritoMunicipal, Seccion, Barrio, SubBarrio, Nombre } = location;
        if(Provincia > 0 && Municipio == 0 && DistritoMunicipal == 0 && Seccion == 0 && Barrio == 0 && SubBarrio == 0)
            provincias.push({ code: Provincia, name: Nombre })
    }

    crearMunicipio();
}

function crearMunicipio() {
    for (const provincia of provincias) {
        const municipio = locations.filter(x => x.Provincia == provincia.code && x.Municipio > 0 && x.DistritoMunicipal == 0 && x.Seccion == 0 && x.Barrio == 0 && x.SubBarrio == 0);
        municipio.forEach(x => {
            municipios.push({ code: x.Municipio, name: x.Nombre, provinceId: provincia.code})
        });
    }

    crearDistritoMunicipal()
}

function crearDistritoMunicipal() {
    for (const provincia of provincias) {
        const municipiosData = municipios.filter(x => x.provinceId == provincia.code);
        for (const municipio of municipiosData) {
            const dm = locations.filter(x => x.Provincia == provincia.code && x.Municipio == municipio.code && x.DistritoMunicipal > 0 && x.Seccion == 0 && x.Barrio == 0 && x.SubBarrio == 0);
            dm.forEach(x => {
                distritoMunicipales.push({ code: x.DistritoMunicipal, name: x.Nombre, provinceId: provincia.code, municipalityId: municipio.code })
            });
        }
    }

    crearSeccion();
}

function crearSeccion() {
    for (const provincia of provincias) {
        const municipiosData = municipios.filter(x => x.provinceId == provincia.code);
        for (const municipio of municipiosData) {
            const DmData = distritoMunicipales.filter(x => x.provinceId == provincia.code && x.municipalityId == municipio.code);
            for (const dm of DmData) {
                const sector = locations.filter(x => x.Provincia == provincia.code && x.Municipio == municipio.code && x.DistritoMunicipal == dm.code && x.Seccion > 0 && x.Barrio == 0 && x.SubBarrio == 0);
            sector.forEach(x => {
                sectores.push({ code: x.Seccion, name: x.Nombre, provinceId: provincia.code, municipalityId: municipio.code, districtId: dm.code })
            });
            }
        }
    }
    crearBarrios();
}

function crearBarrios() {
    for (const provincia of provincias) {
        const municipiosData = municipios.filter(x => x.provinceId == provincia.code);
        for (const municipio of municipiosData) {
            const DmData = distritoMunicipales.filter(x => x.provinceId == provincia.code && x.municipalityId == municipio.code);
            for (const dm of DmData) {
                const sectoresData = sectores.filter(x => x.provinceId == provincia.code && x.municipalityId == municipio.code && x.districtId == dm.code);
                for (const sector of sectoresData) {
                    const barrio = locations.filter(x => x.Provincia == provincia.code && x.Municipio == municipio.code && x.DistritoMunicipal == dm.code && x.Seccion == sector.code && x.Barrio > 0 && x.SubBarrio == 0);
                    barrio.forEach(x => {
                        barrios.push({ code: x.Barrio, name: x.Nombre, provinceId: provincia.code, municipalityId: municipio.code, districtId: dm.code, sectorId: sector.code })
                    });
                }
            }
        }
    }
    crearSubBarrios();
}

function crearSubBarrios() {
    for (const provincia of provincias) {
        const municipiosData = municipios.filter(x => x.provinceId == provincia.code);
        for (const municipio of municipiosData) {
            const DmData = distritoMunicipales.filter(x => x.provinceId == provincia.code && x.municipalityId == municipio.code);
            for (const dm of DmData) {
                const sectoresData = sectores.filter(x => x.provinceId == provincia.code && x.municipalityId == municipio.code && x.districtId == dm.code);
                for (const sector of sectoresData) {
                    const barriosData = barrios.filter(x => x.provinceId == provincia.code && x.municipalityId == municipio.code && x.districtId == dm.code && x.sectorId == sector.code);
                    for (const barrio of barriosData) {
                        const subbarrio = locations.filter(x => x.Provincia == provincia.code && x.Municipio == municipio.code && x.DistritoMunicipal == dm.code && x.Seccion == sector.code && x.Barrio == barrio.code && x.SubBarrio > 0);
                        subbarrio.forEach(x => {
                            subbarrios.push({ code: x.SubBarrio, name: x.Nombre, provinceId: provincia.code, municipalityId: municipio.code, districtId: dm.code, sectorId: sector.code, neighborhoodId: barrio.code });
                        });
                    }

                }
            }
        }
    }
}


// Procesar cada entrada del JSON
crearProvincias();

let structuredData = {
    provinces: provincias,
    municipalities: municipios,
    districts: distritoMunicipales,
    sectors: sectores,
    neighborhood: barrios,
    subNeighborhood: subbarrios
};

// Guardar el resultado en un nuevo archivo JSON
fs.writeFileSync('division-territorial-2021.json', JSON.stringify(structuredData, null, 2));

console.log('Estructura jerárquica creada y guardada en division-territorial-2021.json');
