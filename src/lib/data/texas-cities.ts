/**
 * Texas Cities Dataset
 * Comprehensive list of Texas cities and towns for real estate applications
 */

export interface TexasCity {
  name: string
  county: string
  region: string
  population: number
  zipCodes: string[]
  isMetro: boolean
  coordinates?: {
    lat: number
    lng: number
  }
}

export const TEXAS_CITIES: TexasCity[] = [
  // Houston Metropolitan Area
  { name: "Houston", county: "Harris", region: "Greater Houston", population: 2304580, zipCodes: ["77001", "77002", "77003", "77004", "77005", "77006", "77007", "77008", "77009", "77010", "77011", "77012", "77013", "77014", "77015", "77016", "77017", "77018", "77019", "77020", "77021", "77022", "77023", "77024", "77025", "77026", "77027", "77028", "77029", "77030", "77031", "77032", "77033", "77034", "77035", "77036", "77037", "77038", "77039", "77040", "77041", "77042", "77043", "77044", "77045", "77046", "77047", "77048", "77049", "77050", "77051", "77052", "77053", "77054", "77055", "77056", "77057", "77058", "77059", "77060", "77061", "77062", "77063", "77064", "77065", "77066", "77067", "77068", "77069", "77070", "77071", "77072", "77073", "77074", "77075", "77076", "77077", "77078", "77079", "77080", "77081", "77082", "77083", "77084", "77085", "77086", "77087", "77088", "77089", "77090", "77091", "77092", "77093", "77094", "77095", "77096", "77097", "77098", "77099"], isMetro: true },
  { name: "Sugar Land", county: "Fort Bend", region: "Greater Houston", population: 118600, zipCodes: ["77478", "77479", "77487", "77496", "77498"], isMetro: true },
  { name: "The Woodlands", county: "Montgomery", region: "Greater Houston", population: 114436, zipCodes: ["77380", "77381", "77382", "77384", "77385", "77386", "77389"], isMetro: true },
  { name: "Pearland", county: "Brazoria", region: "Greater Houston", population: 122149, zipCodes: ["77581", "77584", "77588"], isMetro: true },
  { name: "Pasadena", county: "Harris", region: "Greater Houston", population: 151572, zipCodes: ["77501", "77502", "77503", "77504", "77505", "77506", "77507", "77508"], isMetro: true },
  { name: "League City", county: "Galveston", region: "Greater Houston", population: 106622, zipCodes: ["77573", "77574"], isMetro: true },
  { name: "Katy", county: "Harris", region: "Greater Houston", population: 21894, zipCodes: ["77449", "77450", "77491", "77492", "77493", "77494"], isMetro: true },
  { name: "Spring", county: "Harris", region: "Greater Houston", population: 62559, zipCodes: ["77373", "77379", "77388", "77389", "77391"], isMetro: true },
  { name: "Cypress", county: "Harris", region: "Greater Houston", population: 148000, zipCodes: ["77429", "77433", "77065", "77070", "77095"], isMetro: true },
  { name: "Humble", county: "Harris", region: "Greater Houston", population: 17339, zipCodes: ["77338", "77339", "77345", "77346", "77347"], isMetro: true },
  { name: "Kingwood", county: "Harris", region: "Greater Houston", population: 71552, zipCodes: ["77339", "77345", "77346"], isMetro: true },
  { name: "Tomball", county: "Harris", region: "Greater Houston", population: 12341, zipCodes: ["77375", "77377"], isMetro: true },
  { name: "Conroe", county: "Montgomery", region: "Greater Houston", population: 98081, zipCodes: ["77301", "77302", "77303", "77304", "77318", "77384", "77385"], isMetro: true },
  { name: "Friendswood", county: "Harris", region: "Greater Houston", population: 41213, zipCodes: ["77546"], isMetro: true },
  { name: "Missouri City", county: "Fort Bend", region: "Greater Houston", population: 74139, zipCodes: ["77459", "77489", "77498"], isMetro: true },
  { name: "Stafford", county: "Fort Bend", region: "Greater Houston", population: 17693, zipCodes: ["77477", "77497"], isMetro: true },
  { name: "Rosenberg", county: "Fort Bend", region: "Greater Houston", population: 38282, zipCodes: ["77471"], isMetro: true },
  { name: "Richmond", county: "Fort Bend", region: "Greater Houston", population: 11627, zipCodes: ["77469"], isMetro: true },

  // Dallas-Fort Worth Metroplex
  { name: "Dallas", county: "Dallas", region: "Dallas-Fort Worth", population: 1304379, zipCodes: ["75201", "75202", "75203", "75204", "75205", "75206", "75207", "75208", "75209", "75210", "75211", "75212", "75214", "75215", "75216", "75217", "75218", "75219", "75220", "75221", "75222", "75223", "75224", "75225", "75226", "75227", "75228", "75229", "75230", "75231", "75232", "75233", "75234", "75235", "75236", "75237", "75238", "75240", "75241", "75242", "75243", "75244", "75246", "75247", "75248", "75249", "75250", "75251", "75252", "75253", "75254", "75260", "75266", "75267", "75270", "75275", "75277", "75283", "75284", "75285", "75286", "75287", "75294", "75295", "75301", "75303", "75310", "75312", "75313", "75315", "75320", "75323", "75326", "75336", "75339", "75342", "75354", "75355", "75356", "75357", "75359", "75360", "75363", "75364", "75367", "75368", "75370", "75371", "75372", "75373", "75374", "75376", "75378", "75379", "75380", "75381", "75382", "75389", "75390", "75391", "75392", "75393", "75394", "75395", "75396", "75397", "75398"], isMetro: true },
  { name: "Fort Worth", county: "Tarrant", region: "Dallas-Fort Worth", population: 918915, zipCodes: ["76101", "76102", "76103", "76104", "76105", "76106", "76107", "76108", "76109", "76110", "76111", "76112", "76113", "76114", "76115", "76116", "76117", "76118", "76119", "76120", "76121", "76122", "76123", "76124", "76126", "76127", "76129", "76130", "76131", "76132", "76133", "76134", "76135", "76136", "76137", "76140", "76147", "76148", "76150", "76155", "76161", "76162", "76163", "76164", "76166", "76177", "76179", "76180", "76181", "76182", "76185", "76191", "76192", "76193", "76195", "76196", "76197", "76198", "76199"], isMetro: true },
  { name: "Plano", county: "Collin", region: "Dallas-Fort Worth", population: 285494, zipCodes: ["75023", "75024", "75025", "75026", "75074", "75075", "75086", "75093", "75094"], isMetro: true },
  { name: "Arlington", county: "Tarrant", region: "Dallas-Fort Worth", population: 394266, zipCodes: ["76001", "76002", "76003", "76004", "76005", "76006", "76007", "76010", "76011", "76012", "76013", "76014", "76015", "76016", "76017", "76018", "76019", "76094", "76096"], isMetro: true },
  { name: "Irving", county: "Dallas", region: "Dallas-Fort Worth", population: 256684, zipCodes: ["75014", "75015", "75038", "75039", "75060", "75061", "75062", "75063"], isMetro: true },
  { name: "Garland", county: "Dallas", region: "Dallas-Fort Worth", population: 246018, zipCodes: ["75040", "75041", "75042", "75043", "75044", "75045", "75046", "75047", "75048", "75049"], isMetro: true },
  { name: "Frisco", county: "Collin", region: "Dallas-Fort Worth", population: 200509, zipCodes: ["75033", "75034", "75035"], isMetro: true },
  { name: "McKinney", county: "Collin", region: "Dallas-Fort Worth", population: 199177, zipCodes: ["75069", "75070", "75071"], isMetro: true },
  { name: "Grand Prairie", county: "Dallas", region: "Dallas-Fort Worth", population: 196100, zipCodes: ["75050", "75051", "75052", "75053", "75054"], isMetro: true },
  { name: "Richardson", county: "Dallas", region: "Dallas-Fort Worth", population: 119469, zipCodes: ["75080", "75081", "75082", "75083", "75085"], isMetro: true },
  { name: "Denton", county: "Denton", region: "Dallas-Fort Worth", population: 139869, zipCodes: ["76201", "76202", "76203", "76204", "76205", "76206", "76207", "76208", "76209", "76210"], isMetro: true },
  { name: "Lewisville", county: "Denton", region: "Dallas-Fort Worth", population: 111822, zipCodes: ["75022", "75029", "75056", "75057", "75067"], isMetro: true },
  { name: "Allen", county: "Collin", region: "Dallas-Fort Worth", population: 105623, zipCodes: ["75013"], isMetro: true },
  { name: "Flower Mound", county: "Denton", region: "Dallas-Fort Worth", population: 78854, zipCodes: ["75022", "75028"], isMetro: true },
  { name: "Carrollton", county: "Dallas", region: "Dallas-Fort Worth", population: 133168, zipCodes: ["75006", "75007", "75010"], isMetro: true },
  { name: "Round Rock", county: "Williamson", region: "Austin", population: 133372, zipCodes: ["78664", "78665", "78681"], isMetro: true },
  { name: "Mesquite", county: "Dallas", region: "Dallas-Fort Worth", population: 150108, zipCodes: ["75149", "75150", "75181", "75185"], isMetro: true },
  { name: "Addison", county: "Dallas", region: "Dallas-Fort Worth", population: 16661, zipCodes: ["75001"], isMetro: true },
  { name: "Southlake", county: "Tarrant", region: "Dallas-Fort Worth", population: 31684, zipCodes: ["76092"], isMetro: true },
  { name: "Grapevine", county: "Tarrant", region: "Dallas-Fort Worth", population: 54151, zipCodes: ["76051"], isMetro: true },
  { name: "Colleyville", county: "Tarrant", region: "Dallas-Fort Worth", population: 26766, zipCodes: ["76034"], isMetro: true },
  { name: "Euless", county: "Tarrant", region: "Dallas-Fort Worth", population: 60534, zipCodes: ["76039", "76040"], isMetro: true },
  { name: "Bedford", county: "Tarrant", region: "Dallas-Fort Worth", population: 49145, zipCodes: ["76021", "76022"], isMetro: true },
  { name: "Hurst", county: "Tarrant", region: "Dallas-Fort Worth", population: 40413, zipCodes: ["76053"], isMetro: true },

  // Austin Metropolitan Area
  { name: "Austin", county: "Travis", region: "Austin", population: 965872, zipCodes: ["78701", "78702", "78703", "78704", "78705", "78712", "78717", "78719", "78721", "78722", "78723", "78724", "78725", "78726", "78727", "78728", "78729", "78730", "78731", "78732", "78733", "78734", "78735", "78736", "78737", "78738", "78739", "78741", "78742", "78744", "78745", "78746", "78747", "78748", "78749", "78750", "78751", "78752", "78753", "78754", "78756", "78757", "78758", "78759", "78760", "78761", "78762", "78763", "78764", "78765", "78766", "78767", "78768", "78769"], isMetro: true },
  { name: "Cedar Park", county: "Williamson", region: "Austin", population: 77595, zipCodes: ["78613", "78630"], isMetro: true },
  { name: "Pflugerville", county: "Travis", region: "Austin", population: 65191, zipCodes: ["78660"], isMetro: true },
  { name: "Georgetown", county: "Williamson", region: "Austin", population: 75420, zipCodes: ["78626", "78627", "78628", "78633"], isMetro: true },
  { name: "Leander", county: "Williamson", region: "Austin", population: 67124, zipCodes: ["78641", "78645"], isMetro: true },
  { name: "Lakeway", county: "Travis", region: "Austin", population: 21748, zipCodes: ["78734", "78738"], isMetro: true },
  { name: "Bee Cave", county: "Travis", region: "Austin", population: 7847, zipCodes: ["78738"], isMetro: true },
  { name: "Dripping Springs", county: "Hays", region: "Austin", population: 4912, zipCodes: ["78620"], isMetro: true },
  { name: "Westlake", county: "Travis", region: "Austin", population: 3534, zipCodes: ["78746"], isMetro: true },
  { name: "Buda", county: "Hays", region: "Austin", population: 17854, zipCodes: ["78610"], isMetro: true },
  { name: "Kyle", county: "Hays", region: "Austin", population: 45697, zipCodes: ["78640"], isMetro: true },
  { name: "San Marcos", county: "Hays", region: "Austin", population: 67553, zipCodes: ["78666"], isMetro: true },
  { name: "Hutto", county: "Williamson", region: "Austin", population: 34916, zipCodes: ["78634"], isMetro: true },
  { name: "Manor", county: "Travis", region: "Austin", population: 16592, zipCodes: ["78653"], isMetro: true },
  { name: "Taylor", county: "Williamson", region: "Austin", population: 17291, zipCodes: ["76574"], isMetro: false },
  { name: "Jarrell", county: "Williamson", region: "Austin", population: 1896, zipCodes: ["76537"], isMetro: false },
  { name: "Liberty Hill", county: "Williamson", region: "Austin", population: 4269, zipCodes: ["78642"], isMetro: false },
  { name: "Cedar Creek", county: "Bastrop", region: "Austin", population: 3900, zipCodes: ["78612"], isMetro: false },
  { name: "Elgin", county: "Bastrop", region: "Austin", population: 10231, zipCodes: ["78621"], isMetro: false },
  { name: "Bastrop", county: "Bastrop", region: "Austin", population: 9688, zipCodes: ["78602"], isMetro: false },
  { name: "Lockhart", county: "Caldwell", region: "Austin", population: 14379, zipCodes: ["78644"], isMetro: false },
  { name: "Marble Falls", county: "Burnet", region: "Austin", population: 7154, zipCodes: ["78654"], isMetro: false },
  { name: "Wimberley", county: "Hays", region: "Austin", population: 3156, zipCodes: ["78676"], isMetro: false },
  { name: "Bertram", county: "Burnet", region: "Austin", population: 1495, zipCodes: ["78605"], isMetro: false },
  { name: "Granger", county: "Williamson", region: "Austin", population: 1644, zipCodes: ["76530"], isMetro: false },
  { name: "Coupland", county: "Williamson", region: "Austin", population: 320, zipCodes: ["78615"], isMetro: false },

  // San Antonio Metropolitan Area
  { name: "San Antonio", county: "Bexar", region: "San Antonio", population: 1547253, zipCodes: ["78201", "78202", "78203", "78204", "78205", "78207", "78208", "78209", "78210", "78211", "78212", "78213", "78214", "78215", "78216", "78217", "78218", "78219", "78220", "78221", "78222", "78223", "78224", "78225", "78226", "78227", "78228", "78229", "78230", "78231", "78232", "78233", "78234", "78235", "78236", "78237", "78238", "78239", "78240", "78242", "78244", "78245", "78247", "78248", "78249", "78250", "78251", "78252", "78253", "78254", "78255", "78256", "78257", "78258", "78259", "78260", "78261", "78263", "78264", "78265", "78266", "78268", "78269", "78270", "78278", "78279", "78280", "78283", "78284", "78285", "78288", "78289", "78291", "78292", "78293", "78294", "78295", "78296", "78297", "78298", "78299"], isMetro: true },
  { name: "New Braunfels", county: "Comal", region: "San Antonio", population: 90403, zipCodes: ["78130", "78132"], isMetro: true },
  { name: "Schertz", county: "Guadalupe", region: "San Antonio", population: 42433, zipCodes: ["78154"], isMetro: true },
  { name: "Cibolo", county: "Guadalupe", region: "San Antonio", population: 32276, zipCodes: ["78108"], isMetro: true },
  { name: "Seguin", county: "Guadalupe", region: "San Antonio", population: 29594, zipCodes: ["78155"], isMetro: true },
  { name: "Boerne", county: "Kendall", region: "San Antonio", population: 17850, zipCodes: ["78006", "78015"], isMetro: true },
  { name: "Universal City", county: "Bexar", region: "San Antonio", population: 20035, zipCodes: ["78148"], isMetro: true },
  { name: "Converse", county: "Bexar", region: "San Antonio", population: 27331, zipCodes: ["78109"], isMetro: true },
  { name: "Live Oak", county: "Bexar", region: "San Antonio", population: 16118, zipCodes: ["78233"], isMetro: true },
  { name: "Selma", county: "Bexar", region: "San Antonio", population: 11568, zipCodes: ["78154"], isMetro: true },
  { name: "Bulverde", county: "Comal", region: "San Antonio", population: 7636, zipCodes: ["78163"], isMetro: true },
  { name: "Canyon Lake", county: "Comal", region: "San Antonio", population: 33390, zipCodes: ["78133"], isMetro: true },

  // Other Major Texas Cities
  { name: "El Paso", county: "El Paso", region: "West Texas", population: 695044, zipCodes: ["79901", "79902", "79903", "79904", "79905", "79906", "79907", "79908", "79910", "79911", "79912", "79913", "79914", "79915", "79916", "79917", "79918", "79922", "79924", "79925", "79926", "79927", "79928", "79929", "79930", "79932", "79934", "79935", "79936", "79937", "79938"], isMetro: true },
  { name: "Corpus Christi", county: "Nueces", region: "South Texas", population: 317863, zipCodes: ["78401", "78402", "78404", "78405", "78406", "78407", "78408", "78409", "78410", "78411", "78412", "78413", "78414", "78415", "78416", "78417", "78418", "78419"], isMetro: true },
  { name: "Lubbock", county: "Lubbock", region: "West Texas", population: 258862, zipCodes: ["79401", "79402", "79403", "79404", "79407", "79410", "79411", "79412", "79413", "79414", "79415", "79416", "79423", "79424", "79464"], isMetro: true },
  { name: "Laredo", county: "Webb", region: "South Texas", population: 255205, zipCodes: ["78040", "78041", "78043", "78045", "78046"], isMetro: true },
  { name: "Amarillo", county: "Potter", region: "Panhandle", population: 200393, zipCodes: ["79101", "79102", "79103", "79104", "79105", "79106", "79107", "79108", "79109", "79110", "79111", "79114", "79118", "79119", "79120", "79121", "79124"], isMetro: true },
  { name: "Brownsville", county: "Cameron", region: "South Texas", population: 186738, zipCodes: ["78520", "78521"], isMetro: true },
  { name: "Waco", county: "McLennan", region: "Central Texas", population: 139236, zipCodes: ["76701", "76702", "76703", "76704", "76705", "76706", "76707", "76708", "76710", "76711", "76712", "76714", "76715", "76716", "76798"], isMetro: true },
  { name: "Beaumont", county: "Jefferson", region: "East Texas", population: 115282, zipCodes: ["77701", "77702", "77703", "77704", "77705", "77706", "77707", "77708", "77710", "77713", "77720"], isMetro: true },
  { name: "Midland", county: "Midland", region: "West Texas", population: 146038, zipCodes: ["79701", "79703", "79705", "79706", "79707", "79708"], isMetro: true },
  { name: "Odessa", county: "Ector", region: "West Texas", population: 122630, zipCodes: ["79761", "79762", "79763", "79764", "79765", "79766"], isMetro: true },
  { name: "College Station", county: "Brazos", region: "Central Texas", population: 120511, zipCodes: ["77840", "77841", "77842", "77843", "77845"], isMetro: true },
  { name: "Killeen", county: "Bell", region: "Central Texas", population: 153095, zipCodes: ["76540", "76541", "76542", "76543", "76544", "76548", "76549"], isMetro: true },
  { name: "Tyler", county: "Smith", region: "East Texas", population: 105995, zipCodes: ["75701", "75702", "75703", "75704", "75705", "75706", "75707", "75708", "75709", "75710", "75711", "75712", "75713", "75798"], isMetro: true },
  { name: "Abilene", county: "Taylor", region: "West Texas", population: 125182, zipCodes: ["79601", "79602", "79603", "79604", "79605", "79606", "79607", "79608", "79697", "79698", "79699"], isMetro: true },
  { name: "Longview", county: "Gregg", region: "East Texas", population: 81638, zipCodes: ["75601", "75602", "75603", "75604", "75605", "75606", "75607", "75608"], isMetro: true },
  { name: "Wichita Falls", county: "Wichita", region: "North Texas", population: 102316, zipCodes: ["76301", "76302", "76305", "76306", "76307", "76308", "76309", "76310"], isMetro: true },

  // Popular Suburbs and Smaller Cities
  { name: "Cedar Hill", county: "Dallas", region: "Dallas-Fort Worth", population: 48337, zipCodes: ["75104", "75106"], isMetro: false },
  { name: "DeSoto", county: "Dallas", region: "Dallas-Fort Worth", population: 53170, zipCodes: ["75115", "75123"], isMetro: false },
  { name: "Duncanville", county: "Dallas", region: "Dallas-Fort Worth", population: 38524, zipCodes: ["75116", "75137"], isMetro: false },
  { name: "Lancaster", county: "Dallas", region: "Dallas-Fort Worth", population: 41275, zipCodes: ["75134", "75146"], isMetro: false },
  { name: "Mansfield", county: "Tarrant", region: "Dallas-Fort Worth", population: 73138, zipCodes: ["76063"], isMetro: false },
  { name: "Burleson", county: "Tarrant", region: "Dallas-Fort Worth", population: 51618, zipCodes: ["76028"], isMetro: false },
  { name: "Cleburne", county: "Johnson", region: "Dallas-Fort Worth", population: 31352, zipCodes: ["76031", "76033"], isMetro: false },
  { name: "Weatherford", county: "Parker", region: "Dallas-Fort Worth", population: 30854, zipCodes: ["76085", "76086", "76087", "76088"], isMetro: false },
  { name: "Granbury", county: "Hood", region: "Dallas-Fort Worth", population: 10958, zipCodes: ["76048", "76049"], isMetro: false },
  { name: "Wylie", county: "Collin", region: "Dallas-Fort Worth", population: 57526, zipCodes: ["75098"], isMetro: false },
  { name: "Rockwall", county: "Rockwall", region: "Dallas-Fort Worth", population: 47251, zipCodes: ["75032", "75087"], isMetro: false },
  { name: "Rowlett", county: "Dallas", region: "Dallas-Fort Worth", population: 65426, zipCodes: ["75030", "75088"], isMetro: false },
  { name: "Prosper", county: "Collin", region: "Dallas-Fort Worth", population: 30681, zipCodes: ["75078"], isMetro: false },
  { name: "Celina", county: "Collin", region: "Dallas-Fort Worth", population: 16739, zipCodes: ["75009"], isMetro: false },
  { name: "Little Elm", county: "Denton", region: "Dallas-Fort Worth", population: 51042, zipCodes: ["75068"], isMetro: false },
  { name: "The Colony", county: "Denton", region: "Dallas-Fort Worth", population: 45693, zipCodes: ["75056"], isMetro: false },
  { name: "Coppell", county: "Dallas", region: "Dallas-Fort Worth", population: 42983, zipCodes: ["75019"], isMetro: false },
  { name: "Farmers Branch", county: "Dallas", region: "Dallas-Fort Worth", population: 35991, zipCodes: ["75234"], isMetro: false },
  { name: "Highland Park", county: "Dallas", region: "Dallas-Fort Worth", population: 8564, zipCodes: ["75205", "75219"], isMetro: false },
  { name: "University Park", county: "Dallas", region: "Dallas-Fort Worth", population: 25278, zipCodes: ["75205", "75225"], isMetro: false },

  // East Texas
  { name: "Marshall", county: "Harrison", region: "East Texas", population: 23392, zipCodes: ["75670", "75671"], isMetro: false },
  { name: "Texarkana", county: "Bowie", region: "East Texas", population: 36193, zipCodes: ["75501", "75503", "75504"], isMetro: false },
  { name: "Nacogdoches", county: "Nacogdoches", region: "East Texas", population: 32147, zipCodes: ["75961", "75962", "75963"], isMetro: false },
  { name: "Lufkin", county: "Angelina", region: "East Texas", population: 34143, zipCodes: ["75901", "75902", "75904"], isMetro: false },
  { name: "Palestine", county: "Anderson", region: "East Texas", population: 18498, zipCodes: ["75801", "75803"], isMetro: false },
  { name: "Huntsville", county: "Walker", region: "East Texas", population: 45941, zipCodes: ["77320", "77340"], isMetro: false },

  // South Texas
  { name: "McAllen", county: "Hidalgo", region: "South Texas", population: 143268, zipCodes: ["78501", "78503", "78504", "78505"], isMetro: true },
  { name: "Edinburg", county: "Hidalgo", region: "South Texas", population: 100243, zipCodes: ["78539", "78540", "78541", "78542"], isMetro: false },
  { name: "Pharr", county: "Hidalgo", region: "South Texas", population: 79112, zipCodes: ["78577"], isMetro: false },
  { name: "Harlingen", county: "Cameron", region: "South Texas", population: 71829, zipCodes: ["78550", "78551", "78552"], isMetro: false },
  { name: "Mission", county: "Hidalgo", region: "South Texas", population: 84331, zipCodes: ["78572", "78573"], isMetro: false },
  { name: "Victoria", county: "Victoria", region: "South Texas", population: 65098, zipCodes: ["77901", "77902", "77903", "77904", "77905"], isMetro: false },
  { name: "Port Arthur", county: "Jefferson", region: "East Texas", population: 54705, zipCodes: ["77640", "77641", "77642"], isMetro: false },
  { name: "Galveston", county: "Galveston", region: "Greater Houston", population: 53695, zipCodes: ["77550", "77551", "77552", "77553", "77554", "77555"], isMetro: false },
  { name: "Texas City", county: "Galveston", region: "Greater Houston", population: 51898, zipCodes: ["77590", "77591", "77592"], isMetro: false },
  { name: "Baytown", county: "Harris", region: "Greater Houston", population: 83701, zipCodes: ["77520", "77521", "77522", "77523"], isMetro: false },

  // Central Texas
  { name: "Temple", county: "Bell", region: "Central Texas", population: 82073, zipCodes: ["76501", "76502", "76503", "76504", "76505", "76508"], isMetro: false },
  { name: "Bryan", county: "Brazos", region: "Central Texas", population: 84637, zipCodes: ["77801", "77802", "77803", "77804", "77805", "77806", "77807", "77808"], isMetro: false },
  { name: "Kilgore", county: "Gregg", region: "East Texas", population: 14978, zipCodes: ["75662"], isMetro: false },
  { name: "Athens", county: "Henderson", region: "East Texas", population: 12857, zipCodes: ["75751"], isMetro: false },
  { name: "Corsicana", county: "Navarro", region: "Central Texas", population: 23770, zipCodes: ["75110", "75151"], isMetro: false },

  // West Texas
  { name: "San Angelo", county: "Tom Green", region: "West Texas", population: 101004, zipCodes: ["76901", "76902", "76903", "76904", "76905", "76906", "76908", "76909"], isMetro: false },
  { name: "Big Spring", county: "Howard", region: "West Texas", population: 28385, zipCodes: ["79720", "79721"], isMetro: false },
  { name: "Sweetwater", county: "Nolan", region: "West Texas", population: 10900, zipCodes: ["79556"], isMetro: false },
  { name: "Snyder", county: "Scurry", region: "West Texas", population: 12036, zipCodes: ["79549"], isMetro: false },
  { name: "Brownwood", county: "Brown", region: "Central Texas", population: 18813, zipCodes: ["76801", "76802"], isMetro: false }
]

/**
 * Search Texas cities by name with fuzzy matching
 */
export function searchTexasCities(query: string, limit: number = 10): TexasCity[] {
  if (!query || query.length < 2) {
    return TEXAS_CITIES.filter(city => city.isMetro).slice(0, limit)
  }

  const searchTerm = query.toLowerCase().trim()

  // Exact matches first
  const exactMatches = TEXAS_CITIES.filter(city =>
    city.name.toLowerCase().startsWith(searchTerm)
  )

  // Partial matches
  const partialMatches = TEXAS_CITIES.filter(city =>
    city.name.toLowerCase().includes(searchTerm) &&
    !city.name.toLowerCase().startsWith(searchTerm)
  )

  // County matches
  const countyMatches = TEXAS_CITIES.filter(city =>
    city.county.toLowerCase().includes(searchTerm) &&
    !city.name.toLowerCase().includes(searchTerm)
  )

  const allMatches = [...exactMatches, ...partialMatches, ...countyMatches]

  // Sort by population (larger cities first) and metro status
  return allMatches
    .sort((a, b) => {
      if (a.isMetro && !b.isMetro) return -1
      if (!a.isMetro && b.isMetro) return 1
      return b.population - a.population
    })
    .slice(0, limit)
}

/**
 * Get city by exact name
 */
export function getTexasCityByName(name: string): TexasCity | undefined {
  return TEXAS_CITIES.find(city =>
    city.name.toLowerCase() === name.toLowerCase()
  )
}

/**
 * Get cities by county
 */
export function getTexasCitiesByCounty(county: string): TexasCity[] {
  return TEXAS_CITIES.filter(city =>
    city.county.toLowerCase() === county.toLowerCase()
  )
}

/**
 * Get cities by region
 */
export function getTexasCitiesByRegion(region: string): TexasCity[] {
  return TEXAS_CITIES.filter(city =>
    city.region.toLowerCase() === region.toLowerCase()
  )
}

/**
 * Get major metropolitan cities
 */
export function getMajorTexasCities(): TexasCity[] {
  return TEXAS_CITIES.filter(city => city.isMetro && city.population > 100000)
}

/**
 * Validate if a city is in Texas
 */
export function isValidTexasCity(cityName: string): boolean {
  return TEXAS_CITIES.some(city =>
    city.name.toLowerCase() === cityName.toLowerCase()
  )
}

/**
 * Levenshtein distance calculation for fuzzy matching
 * Measures the minimum number of edits (insertions, deletions, substitutions) needed
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Enhanced search result with scoring metadata
 */
export interface TexasCitySearchResult {
  city: TexasCity
  score: number
  matchType: 'exact' | 'prefix' | 'contains' | 'fuzzy' | 'county' | 'census' | 'default'
  isCensusData?: boolean
}

/**
 * Enhanced search with fuzzy matching and smart ranking
 * Handles typos and provides better relevance scoring
 */
export function searchTexasCitiesEnhanced(
  query: string,
  limit: number = 10
): TexasCitySearchResult[] {
  if (!query || query.length < 2) {
    return TEXAS_CITIES
      .filter(city => city.isMetro)
      .slice(0, limit)
      .map(city => ({
        city,
        score: 0,
        matchType: 'default' as const
      }))
  }

  const searchTerm = query.toLowerCase().trim()
  const results: TexasCitySearchResult[] = []

  for (const city of TEXAS_CITIES) {
    const cityName = city.name.toLowerCase()
    const county = city.county.toLowerCase()

    let score = 0
    let matchType: TexasCitySearchResult['matchType'] = 'default'

    // 1. Exact match (highest priority)
    if (cityName === searchTerm) {
      score = 1000
      matchType = 'exact'
    }
    // 2. Starts with (high priority)
    else if (cityName.startsWith(searchTerm)) {
      score = 500 + (100 - searchTerm.length) // Shorter query = better match
      matchType = 'prefix'
    }
    // 3. Contains (medium priority)
    else if (cityName.includes(searchTerm)) {
      score = 250
      matchType = 'contains'
    }
    // 4. Fuzzy match (typo tolerance)
    else {
      const distance = levenshteinDistance(searchTerm, cityName)
      const maxDistance = Math.floor(searchTerm.length / 3) // Allow 1 typo per 3 chars

      if (distance <= maxDistance && distance <= 2) { // Max 2 typos
        score = 200 - (distance * 50) // Fewer errors = higher score
        matchType = 'fuzzy'
      }
    }

    // 5. County match (alternative)
    if (county.includes(searchTerm) && score < 100) {
      score = 150
      matchType = 'county'
    }

    // Boost score based on city attributes
    if (score > 0) {
      // Metro status boost
      if (city.isMetro) score += 50

      // Population boost (logarithmic scale to avoid huge cities dominating)
      if (city.population > 0) {
        score += Math.log10(city.population) * 10
      }

      results.push({
        city,
        score,
        matchType
      })
    }
  }

  // Sort by score (highest first)
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Hybrid search: Static database first, then Census API for missing cities
 * This allows finding ANY Texas city, not just the curated list
 */
export async function searchTexasCitiesHybrid(
  query: string,
  limit: number = 10
): Promise<TexasCitySearchResult[]> {
  // Step 1: Search static database first (fast)
  const staticResults = searchTexasCitiesEnhanced(query, limit)

  // If we have good results, return immediately
  if (staticResults.length >= 3) {
    return staticResults
  }

  // Step 2: Search Census API for missing cities (slower but comprehensive)
  try {
    const censusResults = await searchCensusGeocoder(query)

    // Merge static + census results
    const mergedResults = [
      ...staticResults,
      ...censusResults.map(census => ({
        city: census,
        score: 100, // Lower than exact matches but higher than nothing
        matchType: 'census' as const,
        isCensusData: true
      }))
    ]

    // Remove duplicates (prefer static over census)
    const uniqueResults = mergedResults.filter((result, index, self) =>
      index === self.findIndex(r =>
        r.city.name.toLowerCase() === result.city.name.toLowerCase() &&
        r.city.county.toLowerCase() === result.city.county.toLowerCase()
      )
    )

    return uniqueResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  } catch (error) {
    console.warn('Census API search failed, using static results only:', error)
    return staticResults
  }
}

/**
 * Search Census geocoding API for Texas cities
 * Uses the existing /api/geocoding endpoint
 */
async function searchCensusGeocoder(cityName: string): Promise<TexasCity[]> {
  try {
    const response = await fetch(
      `/api/geocoding?address=${encodeURIComponent(`${cityName}, Texas`)}`
    )

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.result?.addressMatches?.length > 0) {
      return data.result.addressMatches
        .filter((match: any) =>
          match.addressComponents?.state === 'TX' ||
          match.addressComponents?.state === 'Texas'
        )
        .slice(0, 5) // Limit to top 5 Census results
        .map((match: any) => convertCensusToCityObject(match))
    }

    return []
  } catch (error) {
    console.warn('Census geocoder search failed:', error)
    return []
  }
}

/**
 * Determine Texas region from county name
 * Helps categorize Census-sourced cities
 */
function determineRegionFromCounty(county: string): string {
  const regionMap: Record<string, string> = {
    // Greater Houston
    'Harris': 'Greater Houston',
    'Fort Bend': 'Greater Houston',
    'Montgomery': 'Greater Houston',
    'Brazoria': 'Greater Houston',
    'Galveston': 'Greater Houston',

    // Dallas-Fort Worth
    'Dallas': 'Dallas-Fort Worth',
    'Tarrant': 'Dallas-Fort Worth',
    'Collin': 'Dallas-Fort Worth',
    'Denton': 'Dallas-Fort Worth',
    'Rockwall': 'Dallas-Fort Worth',
    'Kaufman': 'Dallas-Fort Worth',
    'Ellis': 'Dallas-Fort Worth',
    'Johnson': 'Dallas-Fort Worth',
    'Parker': 'Dallas-Fort Worth',
    'Hood': 'Dallas-Fort Worth',

    // Austin
    'Travis': 'Austin',
    'Williamson': 'Austin',
    'Hays': 'Austin',
    'Bastrop': 'Austin',
    'Caldwell': 'Austin',

    // San Antonio
    'Bexar': 'San Antonio',
    'Comal': 'San Antonio',
    'Guadalupe': 'San Antonio',
    'Kendall': 'San Antonio',

    // Other regions
    'El Paso': 'West Texas',
    'Lubbock': 'West Texas',
    'Midland': 'West Texas',
    'Ector': 'West Texas',
    'Taylor': 'West Texas',
    'Tom Green': 'West Texas',
    'Potter': 'Panhandle',
    'Randall': 'Panhandle',
    'Smith': 'East Texas',
    'Gregg': 'East Texas',
    'Harrison': 'East Texas',
    'Angelina': 'East Texas',
    'Nacogdoches': 'East Texas',
    'Jefferson': 'East Texas',
    'Cameron': 'South Texas',
    'Hidalgo': 'South Texas',
    'Webb': 'South Texas',
    'Nueces': 'South Texas',
    'McLennan': 'Central Texas',
    'Bell': 'Central Texas',
    'Brazos': 'Central Texas'
  }

  return regionMap[county] || 'Texas'
}

/**
 * Convert Census geocoding result to TexasCity format
 */
function convertCensusToCityObject(censusMatch: any): TexasCity {
  const components = censusMatch.addressComponents || {}
  const coords = censusMatch.coordinates || {}

  // Extract city name (remove state suffix if present)
  let cityName = components.city || components.place || 'Unknown'
  cityName = cityName.replace(/, TX$/, '').replace(/, Texas$/, '').trim()

  // Extract county (remove "County" suffix)
  let countyName = components.county || 'Unknown'
  countyName = countyName.replace(/ County$/, '').trim()

  return {
    name: cityName,
    county: countyName,
    region: determineRegionFromCounty(countyName),
    population: 0, // Unknown from geocoder
    zipCodes: components.zip ? [components.zip] : [],
    isMetro: false, // Conservative default for Census-sourced cities
    coordinates: coords.x && coords.y ? {
      lat: parseFloat(coords.y),
      lng: parseFloat(coords.x)
    } : undefined
  }
}