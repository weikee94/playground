import { registerField } from '../FieldRegistry';
import { TextField } from './TextField';
import { TextAreaField } from './TextAreaField';
import { SelectField } from './SelectField';
import { RadioField } from './RadioField';
import { CheckboxField } from './CheckboxField';
import { DateField } from './DateField';
import { ImageUploadField } from './ImageUploadField';

registerField('text', TextField);
registerField('email', TextField);
registerField('password', TextField);
registerField('number', TextField);
registerField('textarea', TextAreaField);
registerField('select', SelectField);
registerField('radio', RadioField);
registerField('checkbox', CheckboxField);
registerField('date', DateField);
registerField('image-upload', ImageUploadField);
