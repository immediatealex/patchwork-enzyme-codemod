import { shallow } from 'enzyme';
import { screen } from '@testing-library/react';

describe('Button', () => {
  it('should meet basic accessibility criteria', async () => {
    const component = shallow(<Button />).html();

    expect(await axe(component)).toHaveNoViolations();
  });

  it('should render', () => {
    screen.getAllByRole('button');

    expect(true).toBeTruthy();
  });
});
