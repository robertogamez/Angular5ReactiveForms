import { Component, OnInit } from '@angular/core';
import { 
    FormGroup, 
    FormBuilder, 
    Validators, 
    AbstractControl, 
    ValidatorFn,
    FormArray
} from '@angular/forms';

import { Customer } from './customer';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

function emailMatcher(c: AbstractControl): { [key: string]: boolean }{
    const emailControl = c.get('email');
    const confirmControl = c.get('confirmEmail');

    if(emailControl.pristine || confirmControl.pristine){
        return null;
    }

    if(emailControl.value === confirmControl.value){
        return null;
    }

    return {
        'match': true
    };
}

function ratingRange(min: number, max: number): ValidatorFn {
    return (c: AbstractControl): {[key: string]: boolean} | null => {
  
        if(c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)){
            return { 'range': true };
        }
    
        return null;
    }
}

@Component({
    selector: 'my-signup',
    templateUrl: './customer.component.html'
})
export class CustomerComponent implements OnInit  {

    emailMessage: string;

    get addresses(): FormArray {
        return <FormArray>this.customerForm.get('addresses');
    }

    private validationMessages = {
        required: 'Please enter your email address.',
        email: 'Please enter a valid email address.'
    };

    customerForm: FormGroup;
    customer: Customer= new Customer();

    constructor(
        private fb: FormBuilder
    ){

    }

    ngOnInit(): void {

        this.customerForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(3)]],
            lastName: ['', [Validators.required, Validators.maxLength(50)]],
            emailGroup: this.fb.group({
                email: ['', [Validators.required, Validators.email]],
                confirmEmail: ['', [Validators.required]]
            }, { validator: emailMatcher }),
            phone: '',
            rating: [null, ratingRange(1, 5)],
            notification: 'email',
            sendCatalog: true,
            addresses: this.fb.array([ this.buildAddress() ])
        });

        this.customerForm.get('notification').valueChanges.subscribe(
            value => this.setNotification(value)
        );

        const emailControl = this.customerForm.get('emailGroup.email');
        emailControl.valueChanges.pipe(
            debounceTime(1000),
            distinctUntilChanged()
        ).subscribe(
            value => {
                console.log('Entro');
                this.setMessage(emailControl);
            } 
        );
    }

    buildAddress(): FormGroup {
        return this.fb.group({
                addressType: 'home',
                street1: '',
                street2: '',
                city: '',
                state: '',
                zip: ''
        });
    }

    addAddress(): void {
        this.addresses.push(this.buildAddress());
    }

    save() {
        console.log(this.customerForm);
        console.log('Saved: ' + JSON.stringify(this.customerForm.value));
    }

    populateTestData(): void {
        this.customerForm.setValue({
            firstName: 'Robert',
            lastName: 'Manuel',
            email: 'roberto@gmail.com',
            sendCatalog: true
        });
    }

    setNotification(notifyVia: string) : void {
        const phoneControl = this.customerForm.get('phone');
        if(notifyVia === 'text'){
            phoneControl.setValidators(Validators.required);
        } else {
            phoneControl.clearValidators();
        }

        phoneControl.updateValueAndValidity();
    }

    setMessage(c: AbstractControl): void {
        this.emailMessage = '';
        if((c.touched || c.dirty) && c.errors){
            this.emailMessage = Object.keys(c.errors).map(
                key => this.emailMessage += this.validationMessages[key]
            ).join(' ');
        }
    }

 }
