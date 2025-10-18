import { User, Calendar } from 'lucide-react';
import Input from '../common/Input';
import Card from '../common/Card';

/**
 * Basic Information Step - Step 1 of patient intake
 * Collects name, age, and gender information
 */
const BasicInfoStep = ({ formData, onChange, errors, t }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {t('form.step1.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('form.step1.description')}
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name Input */}
          <Input
            label={t('form.name')}
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="Enter patient's full name"
            className="text-lg"
            autoFocus
          />

          {/* Age and Gender Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('form.age')}
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              error={errors.age}
              required
              placeholder="Age in years"
              min="0"
              max="150"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('form.gender')}
                <span className="text-red-500 ml-1" aria-label="required">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="block w-full px-4 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 transition-colors duration-200"
                required
              >
                <option value="Male">{t('form.male')}</option>
                <option value="Female">{t('form.female')}</option>
                <option value="Other">{t('form.other')}</option>
              </select>
              {errors.gender && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.gender}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Step 1 of 4</span>
            <div className="flex space-x-2">
              <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
              Please correct the following errors:
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BasicInfoStep;
