import React from 'react';
import {Grid, TextField, Typography} from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';
// import { useStateValue } from "../../stateContext";
import {useStateValue} from "./StateContext";

const ContactForm = () => {

  const [{formValues}, dispatch] = useStateValue();

  return <>
    <Grid item xs={12}>
      <Typography variant="h6">Contact information</Typography>
    </Grid>
    <Grid item xs={12} sm={4}>
      <TextField
        label="First Name"
        name="firstname"
        variant="outlined"
        required
        fullWidth
        value={formValues.firstname}
        onChange={e =>
          dispatch({
            type: "editFormValue",
            key: "firstname",
            value: e.target.value
          })
        }
      />
    </Grid>
    <Grid item xs={12} sm={4}>
      <TextField
        label="Last Name"
        name="lastname"
        variant="outlined"
        required
        fullWidth
        value={formValues.lastname}
        onChange={e =>
          dispatch({
            type: "editFormValue",
            key: "lastname",
            value: e.target.value
          })
        }
      />
    </Grid>
    <Grid item xs={12} sm={4}>
      <TextField
        label="Email Address"
        name="email"
        variant="outlined"
        required
        fullWidth
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Street Address 1"
        name="line1"
        variant="outlined"
        required
        fullWidth
        value={formValues.line1}
        onChange={e =>
          dispatch({
            type: "editFormValue",
            key: "line1",
            value: e.target.value
          })
        }
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        label="Street Address 2"
        name="line2"
        variant="outlined"
        fullWidth
        value={formValues.line2}
        onChange={e =>
          dispatch({
            type: "editFormValue",
            key: "line2",
            value: e.target.value
          })
        }
      />
    </Grid>
    <Grid item xs={12} sm={4}>
      <TextField
        label="Postal Code"
        name="postal_code"
        variant="outlined"
        required
        fullWidth
        value={formValues.postal_code}
        onChange={e =>
          dispatch({
            type: "editFormValue",
            key: "postal_code",
            value: e.target.value
          })
        }
      />
    </Grid>
    <Grid item xs={12} sm={4}>
      <TextField
        label="City"
        name="city"
        variant="outlined"
        required
        fullWidth
        value={formValues.city}
        onChange={e =>
          dispatch({
            type: "editFormValue",
            key: "city",
            value: e.target.value
          })
        }
      />
    </Grid>
    <Grid item xs={12} sm={4}>
      <Autocomplete
        options={countries}
        getOptionLabel={option => option}
        renderInput={params =>
          <TextField
            label="Country"
            name="country"
            variant="outlined"
            required
            fullWidth
            {...params}
          />
        }
        value={formValues.country}
        onChange={(event, value) => {
          dispatch({
            type: 'editFormValue',
            key: "country",
            value: value
          })
        }}
      />
    </Grid>
  </>
}

export default ContactForm;

let countries = ["United States of America", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua &amp; Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia &amp; Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Cape Verde", "Cayman Islands", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia", "Cruise Ship", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyz Republic", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre &amp; Miquelon", "Samoa", "San Marino", "Satellite", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "St Kitts &amp; Nevis", "St Lucia", "St Vincent", "St. Lucia", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad &amp; Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks &amp; Caicos", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen", "Zambia", "Zimbabwe"];