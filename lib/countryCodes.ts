export interface CountryCode {
  name: string        // "India"
  code: string        // ISO alpha-2 "IN"
  dialCode: string    // "+91"
  flag: string        // "🇮🇳"
  format: string      // '#' = digit, ' ' = separator
  minLength: number
  maxLength: number
  timezone: string    // IANA
  pinned?: boolean
  circles?: Record<string, string>
}

export const INDIA_CIRCLES: Record<string, string> = {
  '9820': 'Mumbai', '9821': 'Mumbai', '9004': 'Mumbai', '9167': 'Mumbai', '9819': 'Mumbai', '9867': 'Mumbai', '9987': 'Mumbai',
  '9810': 'Delhi', '9811': 'Delhi', '9312': 'Delhi', '9313': 'Delhi', '9868': 'Delhi', '9871': 'Delhi', '9873': 'Delhi', '9911': 'Delhi',
  '9845': 'Karnataka', '9844': 'Karnataka', '9886': 'Karnataka', '9980': 'Karnataka', '9964': 'Karnataka', '9743': 'Karnataka', '9742': 'Karnataka',
  '9840': 'Tamil Nadu', '9841': 'Tamil Nadu', '9884': 'Tamil Nadu', '9894': 'Tamil Nadu', '9500': 'Tamil Nadu', '9566': 'Tamil Nadu', '9791': 'Tamil Nadu',
  '9830': 'West Bengal', '9831': 'West Bengal', '9433': 'West Bengal', '9432': 'West Bengal', '9339': 'West Bengal', '9674': 'West Bengal', '7044': 'West Bengal',
  '9848': 'Andhra Pradesh', '9849': 'Andhra Pradesh', '9866': 'Andhra Pradesh', '9676': 'Andhra Pradesh', '9701': 'Andhra Pradesh', '9963': 'Andhra Pradesh', '9652': 'Andhra Pradesh',
  '9895': 'Kerala', '9447': 'Kerala', '9446': 'Kerala', '9388': 'Kerala', '8848': 'Kerala', '9746': 'Kerala', '9961': 'Kerala', '9400': 'Kerala',
  '9825': 'Gujarat', '9924': 'Gujarat', '9974': 'Gujarat', '9426': 'Gujarat', '9898': 'Gujarat', '9727': 'Gujarat', '9427': 'Gujarat',
  '9823': 'Maharashtra', '9822': 'Maharashtra', '9021': 'Maharashtra', '9175': 'Maharashtra', '9881': 'Maharashtra', '9890': 'Maharashtra', '9923': 'Maharashtra',
  '9899': 'Delhi NCR', '9971': 'Delhi NCR', '9650': 'Delhi NCR', '9560': 'Delhi NCR', '9643': 'Delhi NCR', '9999': 'Delhi NCR', '8800': 'Delhi NCR',
  '9718': 'Rajasthan', '9414': 'Rajasthan', '9413': 'Rajasthan', '9829': 'Rajasthan',
  '9977': 'Madhya Pradesh', '9826': 'Madhya Pradesh', '9754': 'Madhya Pradesh',
  '9453': 'Uttar Pradesh', '9415': 'Uttar Pradesh', '9935': 'Uttar Pradesh',
  '9431': 'Bihar', '9430': 'Bihar', '9693': 'Bihar',
  '9437': 'Odisha', '9438': 'Odisha', '9439': 'Odisha',
  '9882': 'Punjab', '9814': 'Punjab', '9815': 'Punjab',
  '9781': 'Haryana', '9812': 'Haryana', '9813': 'Haryana',
  '9418': 'Himachal Pradesh', '9816': 'Himachal Pradesh',
  '9419': 'Jammu & Kashmir', '9906': 'Jammu & Kashmir',
  '9436': 'Assam', '9435': 'Assam',
}

export const COUNTRIES: CountryCode[] = [
  { name: 'Afghanistan', code: 'AF', dialCode: '+93', flag: '🇦🇫', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Asia/Kabul' },
  { name: 'Albania', code: 'AL', dialCode: '+355', flag: '🇦🇱', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Europe/Tirane' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213', flag: '🇩🇿', format: '### ## ## ##', minLength: 9, maxLength: 9, timezone: 'Africa/Algiers' },
  { name: 'Andorra', code: 'AD', dialCode: '+376', flag: '🇦🇩', format: '### ###', minLength: 6, maxLength: 9, timezone: 'Europe/Andorra' },
  { name: 'Angola', code: 'AO', dialCode: '+244', flag: '🇦🇴', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Africa/Luanda' },
  { name: 'Antigua and Barbuda', code: 'AG', dialCode: '+1268', flag: '🇦🇬', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/Antigua' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'America/Argentina/Buenos_Aires' },
  { name: 'Armenia', code: 'AM', dialCode: '+374', flag: '🇦🇲', format: '## ### ###', minLength: 8, maxLength: 8, timezone: 'Asia/Yerevan' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Australia/Sydney' },
  { name: 'Austria', code: 'AT', dialCode: '+43', flag: '🇦🇹', format: '### ### ####', minLength: 10, maxLength: 13, timezone: 'Europe/Vienna' },
  { name: 'Azerbaijan', code: 'AZ', dialCode: '+994', flag: '🇦🇿', format: '## ### ## ##', minLength: 9, maxLength: 9, timezone: 'Asia/Baku' },
  { name: 'Bahamas', code: 'BS', dialCode: '+1242', flag: '🇧🇸', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/Nassau' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'Asia/Bahrain' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩', format: '#### ######', minLength: 10, maxLength: 10, timezone: 'Asia/Dhaka' },
  { name: 'Barbados', code: 'BB', dialCode: '+1246', flag: '🇧🇧', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/Barbados' },
  { name: 'Belarus', code: 'BY', dialCode: '+375', flag: '🇧🇾', format: '## ### ## ##', minLength: 9, maxLength: 9, timezone: 'Europe/Minsk' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪', format: '### ## ## ##', minLength: 9, maxLength: 9, timezone: 'Europe/Brussels' },
  { name: 'Belize', code: 'BZ', dialCode: '+501', flag: '🇧🇿', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/Belize' },
  { name: 'Benin', code: 'BJ', dialCode: '+229', flag: '🇧🇯', format: '## ## ## ##', minLength: 8, maxLength: 8, timezone: 'Africa/Porto-Novo' },
  { name: 'Bermuda', code: 'BM', dialCode: '+1441', flag: '🇧🇲', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Atlantic/Bermuda' },
  { name: 'Bhutan', code: 'BT', dialCode: '+975', flag: '🇧🇹', format: '## ### ###', minLength: 8, maxLength: 8, timezone: 'Asia/Thimphu' },
  { name: 'Bolivia', code: 'BO', dialCode: '+591', flag: '🇧🇴', format: '### ## ## ##', minLength: 8, maxLength: 8, timezone: 'America/La_Paz' },
  { name: 'Bosnia and Herzegovina', code: 'BA', dialCode: '+387', flag: '🇧🇦', format: '## ### ###', minLength: 8, maxLength: 8, timezone: 'Europe/Sarajevo' },
  { name: 'Botswana', code: 'BW', dialCode: '+267', flag: '🇧🇼', format: '## ### ###', minLength: 8, maxLength: 8, timezone: 'Africa/Gaborone' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷', format: '## ##### ####', minLength: 11, maxLength: 11, timezone: 'America/Sao_Paulo' },
  { name: 'Brunei', code: 'BN', dialCode: '+673', flag: '🇧🇳', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Asia/Brunei' },
  { name: 'Bulgaria', code: 'BG', dialCode: '+359', flag: '🇧🇬', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Europe/Sofia' },
  { name: 'Burkina Faso', code: 'BF', dialCode: '+226', flag: '🇧🇫', format: '## ## ## ##', minLength: 8, maxLength: 8, timezone: 'Africa/Ouagadougou' },
  { name: 'Burundi', code: 'BI', dialCode: '+257', flag: '🇧🇮', format: '## ## ## ##', minLength: 8, maxLength: 8, timezone: 'Africa/Bujumbura' },
  { name: 'Cambodia', code: 'KH', dialCode: '+855', flag: '🇰🇭', format: '## ### ###', minLength: 8, maxLength: 9, timezone: 'Asia/Phnom_Penh' },
  { name: 'Cameroon', code: 'CM', dialCode: '+237', flag: '🇨🇲', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'Africa/Douala' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'America/Toronto' },
  { name: 'Cape Verde', code: 'CV', dialCode: '+238', flag: '🇨🇻', format: '### ## ##', minLength: 7, maxLength: 7, timezone: 'Atlantic/Cape_Verde' },
  { name: 'Cayman Islands', code: 'KY', dialCode: '+1345', flag: '🇰🇾', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/Cayman' },
  { name: 'Central African Republic', code: 'CF', dialCode: '+236', flag: '🇨🇫', format: '## ## ## ##', minLength: 8, maxLength: 8, timezone: 'Africa/Bangui' },
  { name: 'Chad', code: 'TD', dialCode: '+235', flag: '🇹🇩', format: '## ## ## ##', minLength: 8, maxLength: 8, timezone: 'Africa/Ndjamena' },
  { name: 'Chile', code: 'CL', dialCode: '+56', flag: '🇨🇱', format: '# #### ####', minLength: 9, maxLength: 9, timezone: 'America/Santiago' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳', format: '### #### ####', minLength: 11, maxLength: 11, timezone: 'Asia/Shanghai' },
  { name: 'Colombia', code: 'CO', dialCode: '+57', flag: '🇨🇴', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'America/Bogota' },
  { name: 'Comoros', code: 'KM', dialCode: '+269', flag: '🇰🇲', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Indian/Comoro' },
  { name: 'Congo (Brazzaville)', code: 'CG', dialCode: '+242', flag: '🇨🇬', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Africa/Brazzaville' },
  { name: 'Congo (DRC)', code: 'CD', dialCode: '+243', flag: '🇨🇩', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Africa/Kinshasa' },
  { name: 'Costa Rica', code: 'CR', dialCode: '+506', flag: '🇨🇷', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'America/Costa_Rica' },
  { name: 'Croatia', code: 'HR', dialCode: '+385', flag: '🇭🇷', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Europe/Zagreb' },
  { name: 'Cuba', code: 'CU', dialCode: '+53', flag: '🇨🇺', format: '# ### ####', minLength: 8, maxLength: 8, timezone: 'America/Havana' },
  { name: 'Curaçao', code: 'CW', dialCode: '+599', flag: '🇨🇼', format: '### ####', minLength: 7, maxLength: 8, timezone: 'America/Curacao' },
  { name: 'Cyprus', code: 'CY', dialCode: '+357', flag: '🇨🇾', format: '## ### ###', minLength: 8, maxLength: 8, timezone: 'Asia/Nicosia' },
  { name: 'Czech Republic', code: 'CZ', dialCode: '+420', flag: '🇨🇿', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Europe/Prague' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: '🇩🇰', format: '## ## ## ##', minLength: 8, maxLength: 8, timezone: 'Europe/Copenhagen' },
  { name: 'Djibouti', code: 'DJ', dialCode: '+253', flag: '🇩🇯', format: '## ## ## ##', minLength: 8, maxLength: 8, timezone: 'Africa/Djibouti' },
  { name: 'Dominica', code: 'DM', dialCode: '+1767', flag: '🇩🇲', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/Dominica' },
  { name: 'Dominican Republic', code: 'DO', dialCode: '+1809', flag: '🇩🇴', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'America/Santo_Domingo' },
  { name: 'Ecuador', code: 'EC', dialCode: '+593', flag: '🇪🇨', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'America/Guayaquil' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'Africa/Cairo' },
  { name: 'El Salvador', code: 'SV', dialCode: '+503', flag: '🇸🇻', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'America/El_Salvador' },
  { name: 'Equatorial Guinea', code: 'GQ', dialCode: '+240', flag: '🇬🇶', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Africa/Malabo' },
  { name: 'Eritrea', code: 'ER', dialCode: '+291', flag: '🇪🇷', format: '# ### ###', minLength: 7, maxLength: 7, timezone: 'Africa/Asmara' },
  { name: 'Estonia', code: 'EE', dialCode: '+372', flag: '🇪🇪', format: '#### ####', minLength: 7, maxLength: 8, timezone: 'Europe/Tallinn' },
  { name: 'Eswatini', code: 'SZ', dialCode: '+268', flag: '🇸🇿', format: '## ## ####', minLength: 8, maxLength: 8, timezone: 'Africa/Mbabane' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251', flag: '🇪🇹', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Africa/Addis_Ababa' },
  { name: 'Fiji', code: 'FJ', dialCode: '+679', flag: '🇫🇯', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Pacific/Fiji' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: '🇫🇮', format: '## ### ####', minLength: 9, maxLength: 10, timezone: 'Europe/Helsinki' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', format: '# ## ## ## ##', minLength: 9, maxLength: 9, timezone: 'Europe/Paris' },
  { name: 'French Polynesia', code: 'PF', dialCode: '+689', flag: '🇵🇫', format: '## ## ## ##', minLength: 8, maxLength: 8, timezone: 'Pacific/Tahiti' },
  { name: 'Gabon', code: 'GA', dialCode: '+241', flag: '🇬🇦', format: '# ## ## ##', minLength: 7, maxLength: 8, timezone: 'Africa/Libreville' },
  { name: 'Gambia', code: 'GM', dialCode: '+220', flag: '🇬🇲', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Africa/Banjul' },
  { name: 'Georgia', code: 'GE', dialCode: '+995', flag: '🇬🇪', format: '### ## ## ##', minLength: 9, maxLength: 9, timezone: 'Asia/Tbilisi' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪', format: '### #######', minLength: 10, maxLength: 12, timezone: 'Europe/Berlin' },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Africa/Accra' },
  { name: 'Greece', code: 'GR', dialCode: '+30', flag: '🇬🇷', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'Europe/Athens' },
  { name: 'Grenada', code: 'GD', dialCode: '+1473', flag: '🇬🇩', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/Grenada' },
  { name: 'Guam', code: 'GU', dialCode: '+1671', flag: '🇬🇺', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Pacific/Guam' },
  { name: 'Guatemala', code: 'GT', dialCode: '+502', flag: '🇬🇹', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'America/Guatemala' },
  { name: 'Guinea', code: 'GN', dialCode: '+224', flag: '🇬🇳', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Africa/Conakry' },
  { name: 'Guinea-Bissau', code: 'GW', dialCode: '+245', flag: '🇬🇼', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Africa/Bissau' },
  { name: 'Guyana', code: 'GY', dialCode: '+592', flag: '🇬🇾', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/Guyana' },
  { name: 'Haiti', code: 'HT', dialCode: '+509', flag: '🇭🇹', format: '## ## ####', minLength: 8, maxLength: 8, timezone: 'America/Port-au-Prince' },
  { name: 'Honduras', code: 'HN', dialCode: '+504', flag: '🇭🇳', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'America/Tegucigalpa' },
  { name: 'Hong Kong', code: 'HK', dialCode: '+852', flag: '🇭🇰', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'Asia/Hong_Kong' },
  { name: 'Hungary', code: 'HU', dialCode: '+36', flag: '🇭🇺', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Europe/Budapest' },
  { name: 'Iceland', code: 'IS', dialCode: '+354', flag: '🇮🇸', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Atlantic/Reykjavik' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳', format: '##### #####', minLength: 10, maxLength: 10, timezone: 'Asia/Kolkata', pinned: true, circles: INDIA_CIRCLES },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩', format: '### #### ####', minLength: 9, maxLength: 12, timezone: 'Asia/Jakarta' },
  { name: 'Iran', code: 'IR', dialCode: '+98', flag: '🇮🇷', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'Asia/Tehran' },
  { name: 'Iraq', code: 'IQ', dialCode: '+964', flag: '🇮🇶', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'Asia/Baghdad' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Europe/Dublin' },
  { name: 'Israel', code: 'IL', dialCode: '+972', flag: '🇮🇱', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Asia/Jerusalem' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹', format: '### ### ####', minLength: 9, maxLength: 11, timezone: 'Europe/Rome' },
  { name: 'Ivory Coast', code: 'CI', dialCode: '+225', flag: '🇨🇮', format: '## ## ## ##', minLength: 8, maxLength: 10, timezone: 'Africa/Abidjan' },
  { name: 'Jamaica', code: 'JM', dialCode: '+1876', flag: '🇯🇲', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/Jamaica' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵', format: '### #### ####', minLength: 10, maxLength: 11, timezone: 'Asia/Tokyo' },
  { name: 'Jordan', code: 'JO', dialCode: '+962', flag: '🇯🇴', format: '# #### ####', minLength: 9, maxLength: 9, timezone: 'Asia/Amman' },
  { name: 'Kazakhstan', code: 'KZ', dialCode: '+7', flag: '🇰🇿', format: '### ### ## ##', minLength: 10, maxLength: 10, timezone: 'Asia/Almaty' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Africa/Nairobi' },
  { name: 'Kiribati', code: 'KI', dialCode: '+686', flag: '🇰🇮', format: '#### ####', minLength: 5, maxLength: 8, timezone: 'Pacific/Tarawa' },
  { name: 'Kosovo', code: 'XK', dialCode: '+383', flag: '🇽🇰', format: '## ### ###', minLength: 8, maxLength: 8, timezone: 'Europe/Belgrade' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'Asia/Kuwait' },
  { name: 'Kyrgyzstan', code: 'KG', dialCode: '+996', flag: '🇰🇬', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Asia/Bishkek' },
  { name: 'Laos', code: 'LA', dialCode: '+856', flag: '🇱🇦', format: '## ### ###', minLength: 8, maxLength: 9, timezone: 'Asia/Vientiane' },
  { name: 'Latvia', code: 'LV', dialCode: '+371', flag: '🇱🇻', format: '## ### ###', minLength: 8, maxLength: 8, timezone: 'Europe/Riga' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961', flag: '🇱🇧', format: '## ### ###', minLength: 7, maxLength: 8, timezone: 'Asia/Beirut' },
  { name: 'Lesotho', code: 'LS', dialCode: '+266', flag: '🇱🇸', format: '## ### ###', minLength: 8, maxLength: 8, timezone: 'Africa/Maseru' },
  { name: 'Liberia', code: 'LR', dialCode: '+231', flag: '🇱🇷', format: '## ### ####', minLength: 8, maxLength: 9, timezone: 'Africa/Monrovia' },
  { name: 'Libya', code: 'LY', dialCode: '+218', flag: '🇱🇾', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Africa/Tripoli' },
  { name: 'Liechtenstein', code: 'LI', dialCode: '+423', flag: '🇱🇮', format: '### ####', minLength: 7, maxLength: 9, timezone: 'Europe/Vaduz' },
  { name: 'Lithuania', code: 'LT', dialCode: '+370', flag: '🇱🇹', format: '### ## ###', minLength: 8, maxLength: 8, timezone: 'Europe/Vilnius' },
  { name: 'Luxembourg', code: 'LU', dialCode: '+352', flag: '🇱🇺', format: '### ###', minLength: 6, maxLength: 11, timezone: 'Europe/Luxembourg' },
  { name: 'Macau', code: 'MO', dialCode: '+853', flag: '🇲🇴', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'Asia/Macau' },
  { name: 'Madagascar', code: 'MG', dialCode: '+261', flag: '🇲🇬', format: '## ## ### ##', minLength: 9, maxLength: 9, timezone: 'Indian/Antananarivo' },
  { name: 'Malawi', code: 'MW', dialCode: '+265', flag: '🇲🇼', format: '### ## ## ##', minLength: 9, maxLength: 9, timezone: 'Africa/Blantyre' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾', format: '## #### ####', minLength: 9, maxLength: 10, timezone: 'Asia/Kuala_Lumpur' },
  { name: 'Maldives', code: 'MV', dialCode: '+960', flag: '🇲🇻', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Indian/Maldives' },
  { name: 'Mali', code: 'ML', dialCode: '+223', flag: '🇲🇱', format: '## ## ## ##', minLength: 8, maxLength: 8, timezone: 'Africa/Bamako' },
  { name: 'Malta', code: 'MT', dialCode: '+356', flag: '🇲🇹', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'Europe/Malta' },
  { name: 'Marshall Islands', code: 'MH', dialCode: '+692', flag: '🇲🇭', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Pacific/Majuro' },
  { name: 'Mauritania', code: 'MR', dialCode: '+222', flag: '🇲🇷', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'Africa/Nouakchott' },
  { name: 'Mauritius', code: 'MU', dialCode: '+230', flag: '🇲🇺', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'Indian/Mauritius' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'America/Mexico_City' },
  { name: 'Micronesia', code: 'FM', dialCode: '+691', flag: '🇫🇲', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Pacific/Pohnpei' },
  { name: 'Moldova', code: 'MD', dialCode: '+373', flag: '🇲🇩', format: '## ## ####', minLength: 8, maxLength: 8, timezone: 'Europe/Chisinau' },
  { name: 'Monaco', code: 'MC', dialCode: '+377', flag: '🇲🇨', format: '## ## ## ##', minLength: 8, maxLength: 9, timezone: 'Europe/Monaco' },
  { name: 'Mongolia', code: 'MN', dialCode: '+976', flag: '🇲🇳', format: '## ## ####', minLength: 8, maxLength: 8, timezone: 'Asia/Ulaanbaatar' },
  { name: 'Montenegro', code: 'ME', dialCode: '+382', flag: '🇲🇪', format: '## ### ###', minLength: 8, maxLength: 8, timezone: 'Europe/Podgorica' },
  { name: 'Morocco', code: 'MA', dialCode: '+212', flag: '🇲🇦', format: '### ## ## ##', minLength: 9, maxLength: 9, timezone: 'Africa/Casablanca' },
  { name: 'Mozambique', code: 'MZ', dialCode: '+258', flag: '🇲🇿', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Africa/Maputo' },
  { name: 'Myanmar', code: 'MM', dialCode: '+95', flag: '🇲🇲', format: '## ### ####', minLength: 8, maxLength: 10, timezone: 'Asia/Rangoon' },
  { name: 'Namibia', code: 'NA', dialCode: '+264', flag: '🇳🇦', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Africa/Windhoek' },
  { name: 'Nauru', code: 'NR', dialCode: '+674', flag: '🇳🇷', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Pacific/Nauru' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: '🇳🇵', format: '## ### ####', minLength: 9, maxLength: 10, timezone: 'Asia/Kathmandu' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱', format: '# ## ## ## ##', minLength: 9, maxLength: 9, timezone: 'Europe/Amsterdam' },
  { name: 'New Caledonia', code: 'NC', dialCode: '+687', flag: '🇳🇨', format: '## ## ##', minLength: 6, maxLength: 6, timezone: 'Pacific/Noumea' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿', format: '## ### ####', minLength: 9, maxLength: 10, timezone: 'Pacific/Auckland' },
  { name: 'Nicaragua', code: 'NI', dialCode: '+505', flag: '🇳🇮', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'America/Managua' },
  { name: 'Niger', code: 'NE', dialCode: '+227', flag: '🇳🇪', format: '## ## ## ##', minLength: 8, maxLength: 8, timezone: 'Africa/Niamey' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'Africa/Lagos' },
  { name: 'North Korea', code: 'KP', dialCode: '+850', flag: '🇰🇵', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Asia/Pyongyang' },
  { name: 'North Macedonia', code: 'MK', dialCode: '+389', flag: '🇲🇰', format: '## ### ###', minLength: 8, maxLength: 8, timezone: 'Europe/Skopje' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴', format: '### ## ###', minLength: 8, maxLength: 8, timezone: 'Europe/Oslo' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'Asia/Muscat' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰', format: '### #######', minLength: 10, maxLength: 10, timezone: 'Asia/Karachi' },
  { name: 'Palau', code: 'PW', dialCode: '+680', flag: '🇵🇼', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Pacific/Palau' },
  { name: 'Palestine', code: 'PS', dialCode: '+970', flag: '🇵🇸', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Asia/Gaza' },
  { name: 'Panama', code: 'PA', dialCode: '+507', flag: '🇵🇦', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'America/Panama' },
  { name: 'Papua New Guinea', code: 'PG', dialCode: '+675', flag: '🇵🇬', format: '### ####', minLength: 7, maxLength: 8, timezone: 'Pacific/Port_Moresby' },
  { name: 'Paraguay', code: 'PY', dialCode: '+595', flag: '🇵🇾', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'America/Asuncion' },
  { name: 'Peru', code: 'PE', dialCode: '+51', flag: '🇵🇪', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'America/Lima' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'Asia/Manila' },
  { name: 'Poland', code: 'PL', dialCode: '+48', flag: '🇵🇱', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Europe/Warsaw' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Europe/Lisbon' },
  { name: 'Puerto Rico', code: 'PR', dialCode: '+1787', flag: '🇵🇷', format: '### ####', minLength: 7, maxLength: 10, timezone: 'America/Puerto_Rico' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'Asia/Qatar' },
  { name: 'Réunion', code: 'RE', dialCode: '+262', flag: '🇷🇪', format: '### ## ## ##', minLength: 9, maxLength: 9, timezone: 'Indian/Reunion' },
  { name: 'Romania', code: 'RO', dialCode: '+40', flag: '🇷🇴', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Europe/Bucharest' },
  { name: 'Russia', code: 'RU', dialCode: '+7', flag: '🇷🇺', format: '### ### ## ##', minLength: 10, maxLength: 10, timezone: 'Europe/Moscow' },
  { name: 'Rwanda', code: 'RW', dialCode: '+250', flag: '🇷🇼', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Africa/Kigali' },
  { name: 'Saint Kitts and Nevis', code: 'KN', dialCode: '+1869', flag: '🇰🇳', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/St_Kitts' },
  { name: 'Saint Lucia', code: 'LC', dialCode: '+1758', flag: '🇱🇨', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/St_Lucia' },
  { name: 'Saint Vincent', code: 'VC', dialCode: '+1784', flag: '🇻🇨', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/St_Vincent' },
  { name: 'Samoa', code: 'WS', dialCode: '+685', flag: '🇼🇸', format: '### ####', minLength: 5, maxLength: 7, timezone: 'Pacific/Apia' },
  { name: 'San Marino', code: 'SM', dialCode: '+378', flag: '🇸🇲', format: '### ### ####', minLength: 6, maxLength: 10, timezone: 'Europe/San_Marino' },
  { name: 'São Tomé and Príncipe', code: 'ST', dialCode: '+239', flag: '🇸🇹', format: '### ####', minLength: 7, maxLength: 7, timezone: 'Africa/Sao_Tome' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Asia/Riyadh' },
  { name: 'Senegal', code: 'SN', dialCode: '+221', flag: '🇸🇳', format: '## ### ## ##', minLength: 9, maxLength: 9, timezone: 'Africa/Dakar' },
  { name: 'Serbia', code: 'RS', dialCode: '+381', flag: '🇷🇸', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Europe/Belgrade' },
  { name: 'Seychelles', code: 'SC', dialCode: '+248', flag: '🇸🇨', format: '# ### ###', minLength: 7, maxLength: 7, timezone: 'Indian/Mahe' },
  { name: 'Sierra Leone', code: 'SL', dialCode: '+232', flag: '🇸🇱', format: '## ### ###', minLength: 8, maxLength: 8, timezone: 'Africa/Freetown' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬', format: '#### ####', minLength: 8, maxLength: 8, timezone: 'Asia/Singapore' },
  { name: 'Slovakia', code: 'SK', dialCode: '+421', flag: '🇸🇰', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Europe/Bratislava' },
  { name: 'Slovenia', code: 'SI', dialCode: '+386', flag: '🇸🇮', format: '## ### ###', minLength: 8, maxLength: 8, timezone: 'Europe/Ljubljana' },
  { name: 'Solomon Islands', code: 'SB', dialCode: '+677', flag: '🇸🇧', format: '### ####', minLength: 5, maxLength: 7, timezone: 'Pacific/Guadalcanal' },
  { name: 'Somalia', code: 'SO', dialCode: '+252', flag: '🇸🇴', format: '## ### ###', minLength: 7, maxLength: 9, timezone: 'Africa/Mogadishu' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Africa/Johannesburg' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷', format: '### #### ####', minLength: 10, maxLength: 11, timezone: 'Asia/Seoul' },
  { name: 'South Sudan', code: 'SS', dialCode: '+211', flag: '🇸🇸', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Africa/Juba' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Europe/Madrid' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: '🇱🇰', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Asia/Colombo' },
  { name: 'Sudan', code: 'SD', dialCode: '+249', flag: '🇸🇩', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Africa/Khartoum' },
  { name: 'Suriname', code: 'SR', dialCode: '+597', flag: '🇸🇷', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/Paramaribo' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪', format: '### ### ####', minLength: 9, maxLength: 10, timezone: 'Europe/Stockholm' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭', format: '## ### ## ##', minLength: 9, maxLength: 9, timezone: 'Europe/Zurich' },
  { name: 'Syria', code: 'SY', dialCode: '+963', flag: '🇸🇾', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Asia/Damascus' },
  { name: 'Taiwan', code: 'TW', dialCode: '+886', flag: '🇹🇼', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Asia/Taipei' },
  { name: 'Tajikistan', code: 'TJ', dialCode: '+992', flag: '🇹🇯', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Asia/Dushanbe' },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255', flag: '🇹🇿', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Africa/Dar_es_Salaam' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭', format: '## #### ####', minLength: 9, maxLength: 9, timezone: 'Asia/Bangkok' },
  { name: 'Timor-Leste', code: 'TL', dialCode: '+670', flag: '🇹🇱', format: '### ####', minLength: 7, maxLength: 8, timezone: 'Asia/Dili' },
  { name: 'Togo', code: 'TG', dialCode: '+228', flag: '🇹🇬', format: '## ## ## ##', minLength: 8, maxLength: 8, timezone: 'Africa/Lome' },
  { name: 'Tonga', code: 'TO', dialCode: '+676', flag: '🇹🇴', format: '### ####', minLength: 5, maxLength: 7, timezone: 'Pacific/Tongatapu' },
  { name: 'Trinidad and Tobago', code: 'TT', dialCode: '+1868', flag: '🇹🇹', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/Port_of_Spain' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216', flag: '🇹🇳', format: '## ### ###', minLength: 8, maxLength: 8, timezone: 'Africa/Tunis' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'Europe/Istanbul' },
  { name: 'Turkmenistan', code: 'TM', dialCode: '+993', flag: '🇹🇲', format: '## ## ## ##', minLength: 8, maxLength: 8, timezone: 'Asia/Ashgabat' },
  { name: 'Turks and Caicos', code: 'TC', dialCode: '+1649', flag: '🇹🇨', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/Grand_Turk' },
  { name: 'Tuvalu', code: 'TV', dialCode: '+688', flag: '🇹🇻', format: '#####', minLength: 5, maxLength: 6, timezone: 'Pacific/Funafuti' },
  { name: 'Uganda', code: 'UG', dialCode: '+256', flag: '🇺🇬', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Africa/Kampala' },
  { name: 'Ukraine', code: 'UA', dialCode: '+380', flag: '🇺🇦', format: '## ### ## ##', minLength: 9, maxLength: 9, timezone: 'Europe/Kiev' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Asia/Dubai', pinned: true },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', format: '#### ######', minLength: 10, maxLength: 10, timezone: 'Europe/London' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'America/New_York' },
  { name: 'Uruguay', code: 'UY', dialCode: '+598', flag: '🇺🇾', format: '# ### ## ##', minLength: 8, maxLength: 9, timezone: 'America/Montevideo' },
  { name: 'US Virgin Islands', code: 'VI', dialCode: '+1340', flag: '🇻🇮', format: '### ####', minLength: 7, maxLength: 7, timezone: 'America/St_Thomas' },
  { name: 'Uzbekistan', code: 'UZ', dialCode: '+998', flag: '🇺🇿', format: '## ### ## ##', minLength: 9, maxLength: 9, timezone: 'Asia/Tashkent' },
  { name: 'Vanuatu', code: 'VU', dialCode: '+678', flag: '🇻🇺', format: '### ####', minLength: 5, maxLength: 7, timezone: 'Pacific/Efate' },
  { name: 'Vatican City', code: 'VA', dialCode: '+39', flag: '🇻🇦', format: '### ### ####', minLength: 9, maxLength: 11, timezone: 'Europe/Vatican' },
  { name: 'Venezuela', code: 'VE', dialCode: '+58', flag: '🇻🇪', format: '### ### ####', minLength: 10, maxLength: 10, timezone: 'America/Caracas' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84', flag: '🇻🇳', format: '### ### ####', minLength: 9, maxLength: 10, timezone: 'Asia/Ho_Chi_Minh' },
  { name: 'Yemen', code: 'YE', dialCode: '+967', flag: '🇾🇪', format: '### ### ###', minLength: 9, maxLength: 9, timezone: 'Asia/Aden' },
  { name: 'Zambia', code: 'ZM', dialCode: '+260', flag: '🇿🇲', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Africa/Lusaka' },
  { name: 'Zimbabwe', code: 'ZW', dialCode: '+263', flag: '🇿🇼', format: '## ### ####', minLength: 9, maxLength: 9, timezone: 'Africa/Harare' },
]

export const PINNED_COUNTRIES: CountryCode[] = [
  COUNTRIES.find(c => c.code === 'IN')!,
  COUNTRIES.find(c => c.code === 'AE')!,
]

// ── Utility functions ────────────────────────────────────────────────────────

export function getCountryByDialCode(dialCode: string): CountryCode | null {
  return PINNED_COUNTRIES.find(c => c.dialCode === dialCode)
    ?? COUNTRIES.find(c => c.dialCode === dialCode)
    ?? null
}

export function getCountryByCode(isoCode: string): CountryCode | null {
  return COUNTRIES.find(c => c.code === isoCode) ?? null
}

export function detectCountryFromNumber(rawNumber: string): CountryCode | null {
  const cleaned = rawNumber.replace(/[^\d+]/g, '')
  const normalized = cleaned.startsWith('+')
    ? cleaned
    : cleaned.startsWith('00') ? '+' + cleaned.slice(2) : null
  if (!normalized) return null
  // Try longest dial code first to avoid +1 matching before +1876
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length)
  return sorted.find(c => normalized.startsWith(c.dialCode)) ?? null
}

export function formatPhoneNumber(digits: string, country: CountryCode): string {
  const fmt = country.format
  let result = ''
  let di = 0
  for (let i = 0; i < fmt.length; i++) {
    if (di >= digits.length) break
    result += fmt[i] === '#' ? digits[di++] : fmt[i]
  }
  return result
}

export function getIndiaCircle(number: string): string | null {
  const digits = number.replace(/\D/g, '')
  return INDIA_CIRCLES[digits.slice(0, 4)] ?? null
}

export function getTimezone(isoCode: string): string {
  return COUNTRIES.find(c => c.code === isoCode)?.timezone ?? 'UTC'
}

// Legacy alias so old imports of `countryCodes` still compile
export const countryCodes = COUNTRIES.map(c => ({
  code: c.dialCode,
  flag: c.flag,
  country: c.name,
  dialCode: c.dialCode,
  name: c.name,
}))
