import { shallow, mount } from 'enzyme';

describe('Button', () => {
  it('should meet basic accessibility criteria', async () => {
    const component = shallow(<Button />).html();

    expect(await axe(component)).toHaveNoViolations();
  });

  it('should mount', () => {
    const component = mount(<Button />);

    expect(component).toBeTruthy();
  });
});
