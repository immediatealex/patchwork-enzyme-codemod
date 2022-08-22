import { shallow } from 'enzyme';
import { render, screen } from '@testing-library/react';

describe('Button', () => {
  it('should meet basic accessibility criteria', async () => {
    const component = shallow(<Button />).html();

    expect(await axe(component)).toHaveNoViolations();
  });

  it('should render', () => {
    render(<Button />);

    const button = screen.findByRole('button');

    expect(button).toBeTruthy();
  });
});
