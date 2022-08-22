import { shallow } from 'enzyme';
import { render } from '@testing-library/react';

describe('Button', () => {
  it('should meet basic accessibility criteria', async () => {
    const component = shallow(<Button />).html();

    expect(await axe(component)).toHaveNoViolations();
  });

  it('should render', () => {
    render(<Button />);

    expect(true).toBeTruthy();
  });
});
